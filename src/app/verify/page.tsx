"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
  countries,
  getUniversalLink,
} from "@selfxyz/qrcode";
import { ethers } from "ethers";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [userId] = useState(ethers.ZeroAddress);
  // Use useMemo to cache the array to avoid creating a new array on each render
  const excludedCountries = useMemo(() => [countries.UNITED_STATES], []);

  // Use useEffect to ensure code only executes on the client side
  useEffect(() => {
    try {
      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME,
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE_SEED,
        endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT}`,
        logoBase64:
          "https://i.postimg.cc/mrmVf9hm/self.png", // url of a png image, base64 is accepted but not recommended
        userId: userId,
        endpointType: "staging_celo",
          // [Onchain Verification] "celo" for mainnet smart contract ,
          // [Onchain Verification] "staging_celo" for testnet smart contract,
          // [Offchain Verification] "https" mainnet https endpoint,
          // [Offchain Verification] "staging_https" for testnet https endpoint
        userIdType: "hex", // use 'hex' for ethereum address or 'uuid' for uuidv4
        userDefinedData: "Hola Buenos Aires!!!",
        
        // [DEEPLINK CALLBACK] Uncomment to automatically redirect user to your app after verification
        //deeplinkCallback: `your-app-deeplink-url`,
        
        disclosures: { 
          // What you want to verify from users identity:
          minimumAge: 18,
          // ofac: true,
          excludedCountries: excludedCountries,
          
          // What you want users to reveal:
          // name: false,
          // issuing_state: true,
          // nationality: true,
          // date_of_birth: true,
          // passport_number: false,
          // gender: true,
          // expiry_date: false,
        }
      }).build();

      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
    }
  }, [excludedCountries, userId]);

  const copyToClipboard = () => {
    if (!universalLink) return;

    navigator.clipboard
      .writeText(universalLink)
      .then(() => {
        toast("Universal link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast("Failed to copy link");
      });
  };

  const openSelfApp = () => {
    if (!universalLink) return;

    window.open(universalLink, "_blank");
    toast("Opening Self App...");
  };

  const handleSuccessfulVerification = () => {
    toast("Verification successful! Redirecting...");
    setTimeout(() => {
      router.push("/verified");
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">
          {process.env.NEXT_PUBLIC_SELF_APP_NAME || "Self Workshop"}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 px-2">
          Scan QR code with Self Protocol App to verify your identity
        </p>
      </div>
{/* Main content */}
<Card className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">
  <CardContent className="p-4 sm:p-6">
    <div className="flex justify-center mb-4 sm:mb-6">
      {selfApp ? (
        <SelfQRcodeWrapper
          selfApp={selfApp}
          onSuccess={handleSuccessfulVerification}
          onError={() => {
            toast("Error: Failed to verify identity");
          }}
        />
      ) : (
        <div className="w-[256px] h-[256px] bg-muted animate-pulse flex items-center justify-center rounded">
          <p className="text-muted-foreground text-sm">Loading QR Code...</p>
        </div>
      )}
    </div>

    <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 mb-4 sm:mb-6">
      <Button
        onClick={copyToClipboard}
        disabled={!universalLink}
        variant="secondary"
        className="flex-1"
      >
        Copy Universal Link
      </Button>

      <Button
        onClick={openSelfApp}
        disabled={!universalLink}
        className="flex-1"
      >
        Open Self App
      </Button>
    </div>

    <div className="flex flex-col items-center gap-2 mt-2">
      <Label className="text-xs uppercase tracking-wide">User Address</Label>
      <div className="bg-muted rounded-md px-3 py-2 w-full text-center break-all text-sm font-mono border">
        {userId ? userId : <span className="text-muted-foreground">Not connected</span>}
      </div>
    </div>
  </CardContent>
</Card>
    </div>
  );
}