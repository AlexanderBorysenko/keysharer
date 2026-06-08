import { ref } from 'vue';

export function useDownload(fileUrl: string | Blob, fileName: string) {
    const isDownloading = ref(false);

    const downloadFile = async () => {
        try {
            isDownloading.value = true;

            let blob;
            if (fileUrl instanceof Blob) {
                // If fileUrl is already a Blob
                blob = fileUrl;
            } else {
                // Fetch the file from the URL
                const response = await fetch(fileUrl);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                blob = await response.blob();
            }

            // Create a link element and trigger the download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading the file:', error);
        } finally {
            isDownloading.value = false;
        }
    };

    return {
        isDownloading,
        downloadFile,
    };
}
