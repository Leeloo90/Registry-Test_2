
import { useState, useCallback, useEffect } from 'react';
import { CLIENT_ID, API_KEY, SCOPES, DISCOVERY_DOCS } from '../config';
import { MediaFile, IndexingStatus, IndexingProgress } from '../types';

declare const google: any;
declare const gapi: any;

export const useGoogleDrive = (onFileDiscovered: (file: MediaFile) => void) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isGapiLoaded, setIsGapiLoaded] = useState(false);
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);
  const [progress, setProgress] = useState<IndexingProgress>({
    status: IndexingStatus.IDLE,
    filesProcessed: 0,
    foldersProcessed: 0
  });

  // Initialize GAPI and GIS
  useEffect(() => {
    const initializeGapi = async () => {
      await new Promise((resolve) => gapi.load('client', resolve));
      await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
      });
      setIsGapiLoaded(true);
    };

    const scriptGapi = document.querySelector('script[src*="apis.google.com/js/api.js"]');
    if (scriptGapi) {
      scriptGapi.addEventListener('load', initializeGapi);
    }

    const scriptGsi = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (scriptGsi) {
      scriptGsi.addEventListener('load', () => setIsGsiLoaded(true));
    }
  }, []);

  const login = useCallback(() => {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.access_token) {
          setAccessToken(response.access_token);
        }
      },
    });
    tokenClient.requestAccessToken({ prompt: 'consent' });
  }, []);

  const openPicker = useCallback((onFolderSelected: (folderId: string) => void) => {
    if (!accessToken) return;

    const view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
      .setSelectFolderEnabled(true)
      .setIncludeFolders(true)
      .setMimeTypes('application/vnd.google-apps.folder');

    const picker = new google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(accessToken)
      .setDeveloperKey(API_KEY)
      .setCallback((data: any) => {
        if (data.action === google.picker.Action.PICKED) {
          const folderId = data.docs[0].id;
          onFolderSelected(folderId);
        }
      })
      .build();
    picker.setVisible(true);
  }, [accessToken]);

  const fetchFilesRecursively = useCallback(async (rootFolderId: string) => {
    setProgress({
      status: IndexingStatus.INDEXING,
      filesProcessed: 0,
      foldersProcessed: 0
    });

    const folderQueue = [rootFolderId];
    let filesCount = 0;
    let foldersCount = 0;

    try {
      while (folderQueue.length > 0) {
        const currentFolderId = folderQueue.shift()!;
        foldersCount++;

        let pageToken: string | undefined = undefined;
        do {
          const response: any = await gapi.client.drive.files.list({
            q: `'${currentFolderId}' in parents and trashed = false`,
            fields: 'nextPageToken, files(id, name, mimeType, size, md5Checksum)',
            pageToken: pageToken,
          });

          const files = response.result.files || [];

          for (const file of files) {
            if (file.mimeType === 'application/vnd.google-apps.folder') {
              folderQueue.push(file.id);
            } else if (
              file.mimeType.startsWith('video/') ||
              file.mimeType.startsWith('audio/') ||
              file.mimeType.startsWith('image/')
            ) {
              const mediaFile: MediaFile = {
                id: file.id,
                name: file.name,
                mimeType: file.mimeType,
                size: file.size || '0',
                md5Checksum: file.md5Checksum,
                parentFolderId: currentFolderId,
                indexedAt: Date.now()
              };
              
              console.log(`[File Discovered] ${mediaFile.name} (${mediaFile.mimeType})`);
              onFileDiscovered(mediaFile);
              filesCount++;
              
              setProgress(prev => ({
                ...prev,
                filesProcessed: filesCount,
                currentFile: mediaFile.name
              }));
            }
          }

          pageToken = response.result.nextPageToken;
        } while (pageToken);

        setProgress(prev => ({
          ...prev,
          foldersProcessed: foldersCount
        }));
      }

      setProgress(prev => ({
        ...prev,
        status: IndexingStatus.COMPLETED,
        currentFile: undefined
      }));
    } catch (error: any) {
      console.error('Recursive fetch error:', error);
      setProgress(prev => ({
        ...prev,
        status: IndexingStatus.ERROR,
        error: error.message || 'Unknown error during indexing'
      }));
    }
  }, [onFileDiscovered]);

  return { 
    accessToken, 
    login, 
    openPicker, 
    fetchFilesRecursively, 
    progress, 
    isReady: isGapiLoaded && isGsiLoaded 
  };
};
