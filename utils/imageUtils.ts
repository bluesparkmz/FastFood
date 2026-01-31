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

/**
 * Verifica se uma string é um emoji válido
 */
export function isEmoji(str: string | null | undefined): boolean {
  if (!str) return false;

  // URLs completas não são emojis
  if (str.startsWith('http') || str.startsWith('data:')) {
    return false;
  }

  // Caminhos de arquivo não são emojis
  if (str.startsWith('/') || str.startsWith('\\')) {
    return false;
  }

  // Extensões de imagem indicam que é um arquivo
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(str)) {
    return false;
  }

  // Se for muito longo, provavelmente é um caminho quebrado
  if (str.length > 50) {
    return false;
  }

  // Se contém barras ou pontos, provavelmente é um caminho
  if (str.includes('/') || str.includes('\\') || (str.includes('.') && str.length > 10)) {
    return false;
  }

  return true;
}
