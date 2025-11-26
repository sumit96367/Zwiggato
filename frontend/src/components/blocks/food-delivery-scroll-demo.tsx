"use client";

import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

interface FoodDeliveryScrollDemoProps {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  videoUrl?: string;
}

export function FoodDeliveryScrollDemo({
  title = "Experience the Future of",
  subtitle = "Food Delivery",
  imageUrl,
  videoUrl = "/videos/hero-video.mp4"
}: FoodDeliveryScrollDemoProps) {
  return (
    <div className="flex flex-col overflow-hidden pb-[500px] pt-[1000px]">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-white">
              {title} <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none text-primary-600 dark:text-primary-400">
                {subtitle}
              </span>
            </h1>
          </>
        }
      >
        {/* Use video if available, otherwise use image */}
        {videoUrl ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="mx-auto rounded-2xl object-cover h-full w-full"
            style={{ pointerEvents: 'none' }}
          >
            <source src={videoUrl} type="video/mp4" />
            {/* Fallback to image if video fails */}
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Food Delivery"
                className="mx-auto rounded-2xl object-cover h-full w-full"
              />
            )}
          </video>
        ) : (
          <img
            src={imageUrl || "https://images.unsplash.com/photo-1504674900247-087700ff89c6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
            alt="Food Delivery"
            className="mx-auto rounded-2xl object-cover h-full w-full"
          />
        )}
      </ContainerScroll>
    </div>
  );
}

