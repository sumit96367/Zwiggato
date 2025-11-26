"use client";

import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden pb-[500px] pt-[1000px]">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-white">
              Unleash the power of <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                Scroll Animations
              </span>
            </h1>
          </>
        }
      >
        {/* Using video from public folder instead of Next.js Image */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="mx-auto rounded-2xl object-cover h-full w-full object-left-top"
          style={{ pointerEvents: 'none' }}
        >
          <source src="/videos/hero-video.mp4" type="video/mp4" />
          {/* Fallback image from Unsplash */}
          <img
            src="https://images.unsplash.com/photo-1504674900247-087700ff89c6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Hero"
            className="mx-auto rounded-2xl object-cover h-full w-full object-left-top"
          />
        </video>
      </ContainerScroll>
    </div>
  );
}

