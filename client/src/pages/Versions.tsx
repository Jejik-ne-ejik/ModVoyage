import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { type MinecraftVersion, type Mod } from "@shared/schema";
import ModCard from "@/components/home/ModCard";

const Versions = () => {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  
  const { data: versions, isLoading: versionsLoading } = useQuery<MinecraftVersion[]>({
    queryKey: ['/api/versions'],
  });
  
  const { data: mods, isLoading: modsLoading } = useQuery<Mod[]>({
    queryKey: ['/api/mods', { version: selectedVersion }],
    enabled: !!selectedVersion,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-primary hover:underline">
          &larr; Back to Home
        </Link>
      </div>
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">Minecraft Versions</h1>
        <p className="text-xl text-white max-w-3xl mx-auto">
          Browse mods by Minecraft version compatibility
        </p>
      </div>
      
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">Select a Minecraft Version</h2>
        
        {versionsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : versions ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {versions.map((version) => (
              <Card 
                key={version.id}
                className={`cursor-pointer transition-all border-2 minecraft-border bg-black 
                  ${selectedVersion === version.version 
                    ? 'border-primary glow-effect' 
                    : 'border-primary/30 hover:border-primary/70'}`}
                onClick={() => setSelectedVersion(version.version)}
              >
                <CardContent className="flex items-center justify-center p-4 h-full">
                  <span className="text-lg font-bold text-white">
                    {version.version}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-black border-2 border-primary/50 rounded-lg minecraft-border">
            <p className="text-white">No Minecraft versions found</p>
          </div>
        )}
      </div>
      
      {selectedVersion && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            Mods for Minecraft {selectedVersion}
          </h2>
          
          {modsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
            </div>
          ) : mods && mods.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {mods.map((mod) => (
                <ModCard key={mod.id} mod={mod} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-black border-2 border-primary/50 rounded-lg minecraft-border">
              <h3 className="text-xl font-bold text-white mb-2">No Mods Found</h3>
              <p className="text-white mb-4">
                We couldn't find any mods for Minecraft {selectedVersion}.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Versions;