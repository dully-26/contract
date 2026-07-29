import api from '../api/axios';

/**
 * Downloads a PDF file via the authenticated axios instance.
 * Using api (not raw fetch with a hardcoded localhost URL) ensures this
 * works correctly both locally and after deployment, and responseType
 * 'blob' prevents the binary PDF data from being corrupted.
 */
export async function downloadPdf(url, filename) {
  try {
    const response = await api.get(url, { responseType: 'blob' });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(link.href);
  } catch (err) {
    let message = 'Imeshindwa kupakua faili. Jaribu tena.';

    // If the server returned an error, it comes back as a Blob too —
    // parse it so we can show the real message instead of a broken file.
    if (err.response?.data instanceof Blob) {
      try {
        const text = await err.response.data.text();
        const json = JSON.parse(text);
        message = json.message || message;
      } catch {
        // response wasn't JSON, keep default message
      }
    }
    alert(message);
  }
}