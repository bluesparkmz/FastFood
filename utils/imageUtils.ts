import { base_url } from '@/api/api';

/**
 * Converte caminho relativo de imagem para URL completa
 * @param imagePath Caminho relativo (ex: /storage/fastfood/restaurants/image.jpg)
 * @returns URL completa (ex: https://api.skyvenda.com/storage/fastfood/restaurants/image.jpg)
 */
export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return '';

  // Se já for URL completa ou base64, retorna como está
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }

  // Remove barra inicial se existir para evitar duplicação
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

  // Concatena base_url com o caminho
  return `${base_url}/${cleanPath}`;
}

/**
 * Converte múltiplas imagens separadas por vírgula
 * @param imagesString String com caminhos separados por vírgula
 * @returns Array de URLs completas
 */
export function getMultipleImageUrls(imagesString: string | null | undefined): string[] {
  if (!imagesString) return [];

  return imagesString
    .split(',')
    .map(path => path.trim())
    .filter(path => path.length > 0)
    .map(getImageUrl);
}
