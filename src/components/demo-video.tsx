"use client";

import { useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type DemoVideoProps = {
  src: string;
  poster: string;
  title?: string;
};

export function DemoVideo({ src, poster, title }: DemoVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  function activateSound() {
    const video = ref.current;
    if (!video) return;
    video.muted = false;
    setMuted(false);
    void video.play();
  }

  return (
    <div className="relative">
      <video
        ref={ref}
        className="aspect-video w-full bg-[#1A1A1A]"
        src={src}
        poster={poster}
        controls
        playsInline
        muted={muted}
        preload="metadata"
        title={title}
        onVolumeChange={() => {
          const video = ref.current;
          if (video) setMuted(video.muted || video.volume === 0);
        }}
      >
        Seu navegador não reproduz vídeo.
      </video>
      {muted ? (
        <Button
          type="button"
          size="sm"
          onClick={activateSound}
          className="absolute bottom-14 right-3 z-10 bg-mustard font-semibold text-white shadow-md hover:bg-mustard-dark"
        >
          <Volume2 className="h-4 w-4" strokeWidth={2.5} />
          Ativar som
        </Button>
      ) : null}
    </div>
  );
}
