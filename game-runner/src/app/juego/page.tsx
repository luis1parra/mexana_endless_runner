"use client";
import { useEffect, useMemo, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { InvalidInvoiceModal } from "@/components/modals/InvalidInvoiceModal";
import logo from "@/assets/images/logo_mexsana.png";
import avatarBoy from "@/assets/images/avatarman.png";
import avatarGirl from "@/assets/images/avatarwoman.png";
import avatarBoyThumb from "@/assets/images/avatarman_tumb.png";
import avatarGirlThumb from "@/assets/images/avatarwoman_tumb.png";
import { Info, Rec } from "@/assets/icons";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import type { ScorePayload } from "@/services/api";

type AvatarKey = "boy" | "girl";

type AvatarInfo = {
  image: StaticImageData;
  thumb: StaticImageData;
  label: string;
};

const avatars: Record<AvatarKey, AvatarInfo> = {
  boy: {
    image: avatarBoy,
    thumb: avatarBoyThumb,
    label: "Hombre Mexsana",
  },
  girl: {
    image: avatarGirl,
    thumb: avatarGirlThumb,
    label: "Mujer Mexsana",
  },
};

const fallbackNickname = "Jugador Mexsana";

const normalizeNumericId = (value: string | number | null): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

export default function JuegoPage() {
  const [nickname, setNickname] = useState(fallbackNickname);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarKey>("boy");
  const [showGame, setShowGame] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionIdUserGame, setSessionIdUserGame] = useState<string | number | null>(null);
  const [sessionInvoiceId, setSessionInvoiceId] = useState<string | number | null>(null);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [tutorialQS, setTutorialQS] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const rawSession = window.localStorage.getItem("session");
      if (!rawSession) {
        return;
      }

      const parsed = JSON.parse(rawSession) as {
        nickname?: unknown;
        selected?: unknown;
        avatar?: unknown;
        avatar_preference?: unknown;
        id_user_game?: unknown;
        id_factura?: unknown;
      };

      if (typeof parsed.nickname === "string" && parsed.nickname.trim().length > 0) {
        setNickname(parsed.nickname.trim());
      }

      if (parsed.avatar === "girl" || parsed.avatar === "boy") {
        setSelectedAvatar(parsed.avatar);
      } else if (parsed.avatar === "M" || parsed.avatar === "H") {
        setSelectedAvatar(parsed.avatar === "M" ? "girl" : "boy");
      } else if (parsed.avatar_preference === "girl" || parsed.avatar_preference === "boy") {
        setSelectedAvatar(parsed.avatar_preference);
      } else if (typeof parsed.selected === "boolean") {
        setSelectedAvatar(parsed.selected ? "girl" : "boy");
      }

      if (typeof parsed.id_user_game === "string" || typeof parsed.id_user_game === "number") {
        setSessionIdUserGame(parsed.id_user_game);
      }

      if (typeof parsed.id_factura === "string" || typeof parsed.id_factura === "number") {
        setSessionInvoiceId(parsed.id_factura);
      }
    } catch {
      // Ignoramos errores de lectura/parseo del storage.
    }
  }, []);

  // Bridge para que el juego (iframe) envíe el puntaje y esperemos la respuesta
  useEffect(() => {
    if (typeof window === "undefined") return;
    const g = window as unknown as { __submitScore?: (payload: ScorePayload) => Promise<unknown> } & Window;
    g.__submitScore = async (payload: ScorePayload) => {
      return await api.submitScore(payload);
    };
    return () => {
      try {
        delete g.__submitScore;
      } catch {
        // ignore
      }
    };
  }, []);

  // Leer querystring del cliente sin useSearchParams para evitar Suspense en build
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search || "");
      const t = params.get("enableTutorial");
      if (t !== null && t !== undefined) {
        setTutorialQS(String(t));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const rawSession = window.localStorage.getItem("session");
      const session = rawSession ? (JSON.parse(rawSession) as Record<string, unknown>) : {};
      const avatarCode = selectedAvatar === "girl" ? "M" : "H";
      session.avatar = avatarCode;
      session.avatar_preference = selectedAvatar;
      session.selected = selectedAvatar === "girl";
      window.localStorage.setItem("session", JSON.stringify(session));
    } catch {
      // Ignoramos errores de escritura en el storage.
    }
  }, [selectedAvatar]);

  // Poll rejection status every 5s while the iframe is active.
  useEffect(() => {
    if (!showGame) {
      return;
    }

    const idUserGame = normalizeNumericId(sessionIdUserGame);
    const invoiceId = normalizeNumericId(sessionInvoiceId);

    if (idUserGame === null || invoiceId === null) {
      return;
    }

    let cancelled = false;

    const checkStatus = async () => {
      try {
        const response = await api.checkRechazo({
          id_user_game: idUserGame,
          id_factura: invoiceId,
        });

        if (!cancelled && typeof response === "object" && response !== null && (response as { rejected?: unknown }).rejected === true) {
          setShowGame(false);
          setIsModalOpen(true);
        }
      } catch {
        // Silently ignore transient errors so the poll keeps running.
      }
    };

    checkStatus();
    const intervalId = setInterval(checkStatus, 5000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [showGame, sessionIdUserGame, sessionInvoiceId]);

  const activeAvatar = useMemo(() => avatars[selectedAvatar], [selectedAvatar]);
  const selectedAvatarCode = selectedAvatar === "girl" ? "M" : "H";

  const handleStartGame = async () => {
    if (isStartingGame) {
      return;
    }

    setStartError(null);

    let idUserGame: string | number | null = sessionIdUserGame ?? null;

    if (typeof window !== "undefined") {
      try {
        const rawSession = window.localStorage.getItem("session");
        if (rawSession) {
          const parsed = JSON.parse(rawSession) as { id_user_game?: string | number; id_factura?: string | number };
          if (parsed?.id_user_game !== undefined && parsed.id_user_game !== null && parsed.id_user_game !== "") {
            idUserGame = parsed.id_user_game;
            setSessionIdUserGame(parsed.id_user_game);
          }

          if (parsed?.id_factura !== undefined && parsed.id_factura !== null && parsed.id_factura !== "") {
            setSessionInvoiceId(parsed.id_factura);
          }
        }
      } catch {
        // Ignoramos errores al re-leer el storage para no bloquear el flujo.
      }
    }

    if (idUserGame === null || idUserGame === undefined || (typeof idUserGame === "string" && idUserGame.trim().length === 0)) {
      setStartError("No encontramos tu sesión activa. Vuelve a ingresar para jugar.");
      return;
    }

    setIsStartingGame(true);

    try {
      const response = await api.updateAvatar({
        id_user_game: idUserGame,
        avatar: selectedAvatarCode,
      });

      const possibleError =
        typeof response === "object" && response !== null
          ? [response.error, response.data && typeof response.data === "object" ? (response.data as { error?: unknown }).error : undefined].find(
              (message) => typeof message === "string" && message.trim().length > 0,
            )
          : undefined;

      if (possibleError) {
        throw new Error(String(possibleError).trim());
      }

      if (
        typeof response === "object" &&
        response !== null &&
        ((response.success !== undefined && response.success === false) || (response.data && typeof response.data === "object" && (response.data as { success?: unknown }).success === false))
      ) {
        throw new Error("No fue posible actualizar tu avatar.");
      }

      // Exponer selección también en window por si se usa fuera del iframe
      // Nota: el juego corre en un iframe con su propio window; pasamos el valor por querystring.
      window.PLAYER_VARIANT = selectedAvatar;
      setShowGame(true);
    } catch (error) {
      setStartError(error instanceof Error ? error.message : "No fue posible iniciar el juego.");
    } finally {
      setIsStartingGame(false);
    }
  };

  if (showGame) {
    return (
      <div className="min-h-screen bg-black">
        <iframe
          src={`../game/index.html?player_variant=${encodeURIComponent(selectedAvatar)}${tutorialQS ? `&tutorial=${encodeURIComponent(tutorialQS)}` : ""}`}
          title="Mexsana Endless Runner"
          className="h-screen w-full border-0"
          allow="autoplay; fullscreen"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white overflow-x-hidden">
      <main className="flex mx-auto w-full flex-1 flex-col px-3 py-10 md:px-10">
        <section className="w-full 
                            sm:flex-1 
                            sm:min-h-full
                            h-full
                            bg-[url('../assets/images/juegobackground_mobile.png')] 
                            sm:bg-[url('../assets/images/gamedinamicbackground.png')] 
                            bg-cover
                            bg-no-repeat
                            bg-top
                            sm:bg-center  
                            relative
                            rounded-[24px] 
                            px-3 
                            py-12 
                            pt-2 
                            text-white
                            lg:px-8 
                            lg:rounded-[48px]
                            ">
          
          <div className="relative z-10 w-full justify-center px-0">
            <div className="flex w-full flex-col">

              <div className="w-2/9 min-w-[100px] max-w-[187px] absolute z-10 left-1/2 -top-2 transform -translate-x-1/2 -translate-y-1/2 lg:min-w-[130px]">
                <Image src={logo} alt="Mexsana" />
              </div>
              <div className="absolute w-full min-w-[390px] max-w-[800px] -z-1 -top-2 left-1/2 transform -translate-x-1/2 flex justify-center ">
                <Rec className="w-full h-auto"/>
              </div>

               <section className="relative top-8 lg:top-4 bg-white/0 relative mt-6 flex flex-1 flex-col md:flex-row md:items-center lg:mt-10 lg:gap-16 lg:px-10">
                <div className="bg-red-400/0 relative hidden mt-10 flex-col items-center text-center md:w-[42%] md:flex md:">
                  <span className="text-[22px] font-bold text-white">{activeAvatar.label}</span>
                  <div className="relative mt-8 w-full lg:w-9/10 xl:w-8/10 2xl:w-7/10">
                    <Image
                      src={activeAvatar.image}
                      alt={activeAvatar.label}
                      className="w-auto h-auto object-contain drop-shadow-[0_25px_45px_rgba(5,21,76,0.48)]"
                    />
                  </div>
                </div>

                <div className="relative mt-1 flex flex-1 flex-col gap-6 lg:mt-0">
                  <div>
                    <h3 className="text-[20px] font-bold text-white/90 md:text-[22px]">
                      ¡Hola {nickname || fallbackNickname}!
                    </h3>
                    <h1 className="mt-2 text-[32px] font-extrabold leading-[0.95] text-white drop-shadow-md md:text-[52px]">
                      Escoge tu avatar <br/> Favorito
                    </h1>
                    <p className="mt-5 w-full text-[17px] font-light text-white md:text-[20px]">
                      Selecciona tu avatar preferido y da inicio a la recolección de los Big Promos de Mexsana por toda la ciudad.
                    </p>
                  </div>

                  <div className="flex flex-row self-center md:self-start">
                    {(Object.keys(avatars) as AvatarKey[]).map((key) => {
                      const avatarOption = avatars[key];
                      const isActive = key === selectedAvatar;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedAvatar(key)}
                          className={`cursor-pointer rounded-[10px] mx-3 p-1 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40 ${
                            isActive ? "border-white bg-white text-[#1A2798] shadow-[0_20px_40px_rgba(11,33,110,0.35)]" : "border-transparent bg-white/18 text-white hover:bg-white/28"
                          }`}
                          aria-pressed={isActive}>
                          <div className="flex flex-col items-center">
                            <Image src={avatarOption.thumb} alt={avatarOption.label} className="w-21 object-contain rounded-[8px]" />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="bg-blue-400/0 relative flex flex-col items-center text-center max-w-[250px] self-center md:w-[35%] md:hidden">
                    <span className="text-[20px] font-bold text-white">{activeAvatar.label}</span>
                    <div className="relative mt-4 w-full">
                      <Image
                        src={activeAvatar.image}
                        alt={activeAvatar.label}
                        className={`w-full object-contain drop-shadow-[0_25px_45px_rgba(5,21,76,0.48)] ${selectedAvatarCode=='H'?'bg-[var(--cpthumbh)]/90':'bg-[var(--cpthumbm)]/90'}`}
                        sizes="(max-width: 1024px) 80vw, 360px"
                        priority
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div className="flex items-start gap-3 rounded-[26px] bg-white px-6 py-3 text-[var(--cpdblue)] shadow-[0_25px_45px_rgba(11,37,117,0.28)] lg:w-7/8">
                      <span className="pt-1"><Info /></span>
                      <p className="text-[15px] font-medium md:text-[15px]">
                        Nota: Una vez que ingreses a la partida, no podrás salir del juego. Si lo haces, perderás la oportunidad de jugar y tendrás que ingresar una nueva factura.
                      </p>
                    </div>

                    {startError && <p className="max-w-md rounded-[10px] bg-white/40 px-5 py-3 text-sm font-semibold text-[#D52D2D] shadow-[0_12px_24px_rgba(12,35,106,0.2)]">{startError}</p>}
                    <div className="flex flex-row-reverse self-center md:self-end">
                      <button
                        type="button"
                        onClick={handleStartGame}
                        disabled={isStartingGame}
                        className={`cursor-pointer mb-12 lg:mb-10 w-fit rounded-full px-10 py-2 lg:py-4 text-lg font-semibold text-[var(--cpdblue)] shadow-[0_22px_44px_rgba(12,35,106,0.35)] transition ${
                          isStartingGame ? "cursor-not-allowed bg-white/80 text-[#1D3FCE]/70" : "bg-white hover:bg-[#F2F6FF]"
                        }`}
                        aria-busy={isStartingGame}>
                        {isStartingGame ? "Iniciando..." : "Iniciar juego"}
                      </button>

                      {/* <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="cursor-pointer mx-5 w-fit rounded-full bg-white px-10 py-4 text-lg font-semibold text-[#1D3FCE] shadow-[0_22px_44px_rgba(12,35,106,0.35)] transition hover:bg-[#F2F6FF]">
                        Factura Inválida
                      </button> */}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>
      <InvalidInvoiceModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onBackToStart={() => router.push("/")} />
    </div>
  );
}
