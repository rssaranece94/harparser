/// <reference lib="webworker" />

import { APP_NAME } from './app-constant';

addEventListener('message', ({ data }) => {
  if (data?.src !== APP_NAME) return;
  console.log('Worker: Received data for processing.', data);
  if (data?.file instanceof File) {
    parseDoc(data.file).then((htm: any) => {
      console.log('Worker: HTML generated.');
      postMessage(htm);
    });
  }
});

export function parseDoc(file: File): Promise<any> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    try {
      reader.onload = function (e) {
        console.log('Worker: File reading done.');
        if (e.target?.result && typeof e.target.result === 'string') {
          const harContent = JSON.parse(e?.target?.result ?? '{}');
          resolve(harContent);
        }
      };
      reader.readAsText(file);
    } catch (e) {
      reject(e);
    }
  });
}
