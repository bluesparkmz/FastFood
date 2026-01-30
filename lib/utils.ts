import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import "dayjs/locale/pt"

dayjs.extend(relativeTime)
dayjs.locale("pt")

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number,
  locale: string = "pt-MZ",
  currency: string = "MZN"
): string {
  // Formata o valor com Intl.NumberFormat
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);

  // Substitui "MTn" por "MZN" se necessário
  return formatted.replace("MTn", "MZN");
}

export function formatTimeAgo(date: string | Date | null | undefined): string {
  if (!date) return "";
  if (date === "Agora" || date === "agora") return "agora";

  let dateStr = typeof date === 'string' ? date : (date instanceof Date ? date.toISOString() : String(date));

  // O backend Python envia datas UTC sem o sufixo 'Z' (ex: 2023-01-01T12:00:00)
  // O dayjs interpreta isso como hora local, o que causa discrepância de fuso (ex: +2h em MZ).
  // Forçamos a interpretação UTC adicionando 'Z' se não houver timezone.
  if (typeof dateStr === 'string' && dateStr.includes('T') && !dateStr.endsWith('Z') && !dateStr.includes('+')) {
    dateStr += 'Z';
  }

  const parsedDate = dayjs(dateStr);
  if (!parsedDate.isValid()) return String(date);

  return parsedDate.fromNow();
}

/**
 * Resolve o caminho de uma imagem (avatar ou produto) para URL completa.
 * @param src O caminho (string) ou objeto de usuário
 * @param baseUrl A URL base da API
 * @param isProduct Se true, usa o prefixo /storage/, caso contrário tenta /perfil/ (para usuários)
 */
export function resolveAvatar(src: any, baseUrl: string, isProduct: boolean = false): string {
  if (!src) return "/avatar.png";

  let path = "";
  if (typeof src === 'object') {
    path = src.avatar || src.profile_image || src.profile_photo || src.foto || src.perfil || "";
    isProduct = false; // Se for objeto de usuário, assume que não é produto
  } else {
    path = String(src);
  }

  if (!path || path === "undefined" || path === "null") return "/avatar.png";

  // Se já tem http/https, apenas garante que usa api.skyvenda.com
  if (path.startsWith("http")) {
    if (path.includes("skyvenda.com") && !path.includes("api.skyvenda.com")) {
      return path.replace("skyvenda.com", "api.skyvenda.com");
    }
    return path;
  }

  // Remove barra inicial para consistência
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;

  // Garantir que baseUrl usa o subdomínio api se estivermos em produção
  let finalBaseUrl = baseUrl;
  if (baseUrl.includes("skyvenda.com") && !baseUrl.includes("api.skyvenda.com")) {
    finalBaseUrl = baseUrl.replace("skyvenda.com", "api.skyvenda.com");
  }

  // Se o caminho já contém storage/ ou uploads/, apenas prefixamos com finalBaseUrl
  if (cleanPath.startsWith("storage/") || cleanPath.startsWith("uploads/")) {
    return `${finalBaseUrl}/${cleanPath}`;
  }

  // Para todos os outros casos, adiciona /storage/ antes do path
  // Isso cobre: perfil/..., products/..., ou qualquer outro path relativo
  return `${finalBaseUrl}/storage/${cleanPath}`;
}

/**
 * Função segura para renderizar texto que pode vir como objeto da API.
 * Garante que o retorno seja sempre uma string para evitar erros do React (#31).
 */
export function renderSafeText(text: any, fallback = ""): string {
  if (text === null || text === undefined) return fallback;

  if (typeof text === 'object') {
    // Tenta extrair campos comuns de texto
    const val = text.text || text.content || text.message || text.comment;

    if (val === null || val === undefined) {
      // Se não encontrou campos, mas é um objeto, stringifica se não for vazio
      const stringified = JSON.stringify(text);
      return stringified === '{}' ? fallback : stringified;
    }

    // Recorsivo para o caso de val também ser um objeto
    if (typeof val === 'object') {
      return renderSafeText(val, fallback);
    }

    return String(val);
  }

  return String(text);
}
