'use client';

import { BASIC_AUTH_TOKEN, REMOTE_API_BASE_URL } from "./config";

type SessionFields = {
  id_user_game?: string | number;
  nickname?: string;
  id_factura?: string | number;
};

type HttpMethod = "GET" | "POST";
type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  signal?: AbortSignal;
};

async function request<TResponse>(
  endpoint: string,
  { method = "POST", body, signal }: RequestOptions = {},
): Promise<TResponse> {
  const response = await fetch(`${REMOTE_API_BASE_URL}${endpoint}`, {
    method,
    headers: (() => {
      const h: Record<string, string> = { Authorization: `Basic ${BASIC_AUTH_TOKEN}` };
      if (method !== "GET" && body !== undefined) {
        h["Content-Type"] = "application/json";
      }
      return h;
    })(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    let parsedMessage: string | null = null;
    try {
      const parsed = JSON.parse(errorText) as { error?: unknown };
      if (parsed && typeof parsed.error === "string") {
        parsedMessage = parsed.error;
      }
    } catch {
      // ignore JSON parse errors
    }
    if (parsedMessage) {
      throw new Error(parsedMessage);
    }
    throw new Error(
      `Error ${response.status} al consumir ${endpoint}: ${errorText}`,
    );
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as TResponse;
  }

  // If the API does not return JSON, fallback to text response.
  return (await response.text()) as unknown as TResponse;
}

export type RegistrationPayload = {
  nombre: string;
  correo: string;
  nickname: string;
  edad: number;
  genero: string;
  lugar_compra: string;
  numero_factura: string;
  foto_factura: string;
};

export type LoginPayload = {
  correo: string;
  lugar_compra: string;
  numero_factura: string;
  foto_factura: string;
};

export type ApiSessionResponse = SessionFields & {
  success?: boolean;
  error?: string;
  data?: SessionFields & {
    error?: string;
    success?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type RankingEntry = {
  posicion: number;
  avatar: string | null;
  nickname: string;
  sumatoria: number;
  selected?: boolean;
};

export type RankingResponse = {
  ranking: RankingEntry[];
};

export type LastScoreEntry = {
  nickname?: string | null;
  avatar?: "H" | "M" | string | null;
  puntaje?: number | string | null;
  sumatoria?: number | string | null;
  posicion?: number | string | null;
};

export type LastScoreResponse = LastScoreEntry & {
  data?: LastScoreEntry | null;
  last_score?: LastScoreEntry | null;
};

export type UpdateAvatarPayload = {
  id_user_game: string | number;
  avatar: "H" | "M";
};

export type UpdateAvatarResponse = {
  success?: boolean;
  error?: string;
  data?: {
    success?: boolean;
    error?: string;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
};

export type ScorePayload = {
  id_user_game: string | number;
  id_factura: string | number;
  puntaje: number;
  tiempo_jugado: number;
  vidas_restantes: number;
  fecha_inicio: string;
  fecha_fin: string;
};

export const api = {
  register: (payload: RegistrationPayload) =>
    request<ApiSessionResponse>("registro.php", { body: payload }),
  login: (payload: LoginPayload) =>
    request<ApiSessionResponse>("login.php", { body: payload }),
  submitScore: (payload: ScorePayload, signal?: AbortSignal) =>
    request("recpuntaje.php", { body: payload, signal }),
  fetchRanking: (params?: { n?: number; id_user_game?: string | number }) => {
    const q = new URLSearchParams();
    if (params?.n != null) q.set("n", String(params.n));
    if (params?.id_user_game != null) q.set("id_user_game", String(params.id_user_game));
    const endpoint = q.toString() ? `ranking.php?${q.toString()}` : "ranking.php";
    return request<RankingResponse>(endpoint, { method: "GET" });
  },
  fetchLastScore: (params?: { id_user_game?: string | number; id_factura?: string | number }) => {
    const body: Record<string, string> = {};
    if (params?.id_user_game != null) body.id_user_game = String(params.id_user_game);
    if (params?.id_factura != null) body.id_factura = String(params.id_factura);
    return request<LastScoreResponse>("lastpuntaje.php", { body });
  },
  updateAvatar: (payload: UpdateAvatarPayload) =>
    request<UpdateAvatarResponse>("updateavatar.php", { body: payload }),
};







