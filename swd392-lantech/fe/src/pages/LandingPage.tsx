import React, { useState, Suspense, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import { useTranslation } from "../hooks/useTranslation";
import { motion, AnimatePresence } from "motion/react";
import {
  Sun,
  Moon,
  Globe,
  ChevronDown,
  Check,
  Map,
  Layers,
  Bot,
  Mic,
} from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useFBX, Html } from "@react-three/drei";
import * as THREE from "three";
import heroMascot from "../assets/hero-mascot.png";

function MascotModel({ darkMode }: { darkMode: boolean }) {
  const fbx = useFBX("/Happy Idle.fbx");
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    if (fbx) {
      // Calculate static geometry bounding box for automatic scale and placement
      let minX = Infinity,
        minY = Infinity,
        minZ = Infinity;
      let maxX = -Infinity,
        maxY = -Infinity,
        maxZ = -Infinity;

      fbx.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) {
            if (!mesh.geometry.boundingBox) {
              mesh.geometry.computeBoundingBox();
            }
            const bbox = mesh.geometry.boundingBox;
            if (bbox) {
              minX = Math.min(minX, bbox.min.x);
              minY = Math.min(minY, bbox.min.y);
              minZ = Math.min(minZ, bbox.min.z);
              maxX = Math.max(maxX, bbox.max.x);
              maxY = Math.max(maxY, bbox.max.y);
              maxZ = Math.max(maxZ, bbox.max.z);
            }
          }
        }
      });

      let sizeX = 0,
        sizeY = 0,
        sizeZ = 0;
      let centerX = 0,
        centerZ = 0;

      if (maxX > -Infinity) {
        sizeX = maxX - minX;
        sizeY = maxY - minY;
        sizeZ = maxZ - minZ;
        centerX = (minX + maxX) / 2;
        centerZ = (minZ + maxZ) / 2;
      } else {
        const box = new THREE.Box3().setFromObject(fbx);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        sizeX = size.x;
        sizeY = size.y;
        sizeZ = size.z;
        centerX = center.x;
        centerZ = center.z;
        minY = box.min.y;
      }

      const maxDim = Math.max(sizeX, sizeY, sizeZ);
      // Mascot height target in ThreeJS units
      const targetHeight = 2.0;
      const scaleVal = targetHeight / (maxDim || 1);

      fbx.scale.setScalar(scaleVal);

      // Center horizontally and place feet at y = 0
      fbx.position.x = -centerX * scaleVal;
      fbx.position.y = -minY * scaleVal;
      fbx.position.z = -centerZ * scaleVal;
      fbx.rotation.set(0, 0, 0);

      if (fbx.animations && fbx.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(fbx);
        mixerRef.current = mixer;
        const action = mixer.clipAction(fbx.animations[0]);
        action.play();
      }

      fbx.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          if (mesh.material) {
            const mats = Array.isArray(mesh.material)
              ? mesh.material
              : [mesh.material];
            mats.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                mat.roughness = 0.6;
                mat.metalness = 0.1;
              }
            });
          }
        }
      });
    }

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, [fbx]);

  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  return (
    <group rotation={[0.2, -0.1, 0]}>
      <primitive object={fbx} />
    </group>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { role, login, darkMode, toggleDarkMode, language, setLanguage } =
    useAppStore();
  const { t } = useTranslation();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const handleEnterAuth = (
    mode: "login" | "register",
    selectRole?: "student" | "ranger",
  ) => {
    if (selectRole === "ranger") {
      login("Admin", "ranger@lantech.org");
      navigate("/ranger");
    } else {
      navigate("/auth", { state: { mode } });
    }
  };

  const languagesList = [
    { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
    { code: "ja", label: "日本語", flag: "🇯🇵" },
    { code: "ko", label: "한국어", flag: "🇰🇷" },
  ];

  const currentLangObj =
    languagesList.find((l) => l.code === language) || languagesList[0];

  return (
    <div
      className="min-h-screen w-full flex flex-col bg-[#fbfbf7] dark:bg-background transition-colors duration-300 relative overflow-x-hidden"
      style={{
        fontFamily: "var(--font-family)",
      }}
    >
      {/* Top Navbar */}
      <nav className="header bg-[#fbfbf7] dark:bg-background z-40 relative w-full max-w-[1320px] mx-auto px-8 h-[86px] flex items-center justify-between">
        {/* Logo */}
        <div
          className="logo cursor-pointer flex items-center gap-3 flex-shrink-0"
          onClick={() => navigate("/")}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#45d300] shadow-sm transition-transform hover:rotate-12 duration-300">
            <span className="text-2xl">🌱</span>
          </div>
          <span className="logo-text text-[#101827] dark:text-foreground font-black text-2xl whitespace-nowrap">
            Lantech <span className="text-[#45d300]">English</span>
          </span>
        </div>

        {/* Action Buttons, Lang Dropdown & Theme Toggle */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          {/* Light/Dark Toggle */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl cursor-pointer border border-[#dfe3ea] bg-white text-[#101827] dark:bg-card dark:text-foreground hover:bg-gray-50 transition-colors outline-none shadow-sm flex items-center justify-center"
            title={darkMode ? t("lightModeTitle") : t("darkModeTitle")}
          >
            {darkMode ? (
              <Sun className="w-4.5 h-4.5 text-yellow-500 animate-pulse" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-[#101827]" />
            )}
          </motion.button>

          {/* Language Switcher */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="px-3.5 py-2.5 rounded-xl cursor-pointer border border-[#dfe3ea] bg-white text-[#101827] dark:bg-card dark:text-foreground hover:bg-gray-50 transition-all outline-none shadow-sm flex items-center gap-2 font-bold text-xs"
            >
              <Globe className="w-4 h-4 text-[#6b7280]" />
              <span>{currentLangObj.flag}</span>
              <span className="hidden md:inline">{currentLangObj.label}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${isLangDropdownOpen ? "rotate-180" : ""}`}
              />
            </motion.button>

            <AnimatePresence>
              {isLangDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsLangDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-40 rounded-xl bg-card border border-border shadow-xl z-50 p-1.5 flex flex-col gap-0.5"
                  >
                    {languagesList.map((langItem) => (
                      <button
                        key={langItem.code}
                        onClick={() => {
                          setLanguage(langItem.code);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-lg cursor-pointer border-none text-left flex items-center justify-between text-xs font-bold transition-colors ${
                          language === langItem.code
                            ? "bg-brand/10 text-[#45d300] dark:text-[#45d300]"
                            : "bg-transparent text-foreground hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{langItem.flag}</span>
                          <span>{langItem.label}</span>
                        </div>
                        {language === langItem.code && (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="h-6 w-px bg-[#dfe3ea] hidden sm:block" />

          <motion.button
            onClick={() => handleEnterAuth("login")}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 rounded-full cursor-pointer border border-[#dfe3ea] bg-white dark:bg-transparent text-[#101827] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 font-extrabold text-base transition-colors hidden sm:block shadow-sm"
          >
            {t("landingSignIn")}
          </motion.button>

          {/* Join Trail Button */}
          <motion.button
            onClick={() => handleEnterAuth("register")}
            whileHover={{
              scale: 1.05,
              filter: "brightness(1.05)",
            }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 bg-[#45d300] hover:bg-[#3db800] text-white rounded-full cursor-pointer border-none outline-none font-extrabold text-base hidden sm:block shadow-sm"
          >
            {t("landingJoinTrail")}
          </motion.button>
        </div>
      </nav>
 
      {/* Hero Section */}
      <div className="hero">
        {/* Left Column (Content) */}
        <div className="flex flex-col items-start text-left">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E7F9D4] text-[#45d300] text-sm font-black tracking-wider uppercase mb-6 shadow-sm">
            <span>🌱</span> {t("landingPillBadge")}
          </div>
 
          {/* Headline */}
          <h1 className="hero-title">
            {t("landingHeroHeaderMain")}
            <span className="accent">
              {t("landingHeroHeaderSub")}
            </span>
          </h1>
 
          {/* Description */}
          <p className="hero-description">{t("landingHeroDesc")}</p>
 
          {/* Action Buttons */}
          <div className="hero-actions">
            {/* Primary Button */}
            <motion.button
              onClick={() => handleEnterAuth("register")}
              className="btn-primary"
            >
              {t("landingCtaJoin")}
            </motion.button>
 
            {/* Secondary Button */}
            <motion.button
              onClick={() => handleEnterAuth("login")}
              className="btn-secondary"
            >
              <span>▶</span> {t("landingCtaLogin")}
            </motion.button>
          </div>
 
          {/* Guarantee Text */}
          <div className="flex items-center gap-6 mt-6 text-[#22c55e] font-extrabold text-base">
            <div className="flex items-center gap-1.5">
              <span>✓</span> {t("landingFreeStart")}
            </div>
            <div className="flex items-center gap-1.5">
              <span>🛡️</span> {t("landingNoCard")}
            </div>
          </div>
        </div>

        {/* Right Column (Hero Visual) */}
        <div className="hero-visual relative w-full h-[500px] lg:h-[580px] flex items-center justify-center">
          {/* Soft pale green blob behind the image */}
          <div className="absolute w-[80%] h-[80%] rounded-full bg-[#e8fcdb] dark:bg-[#45d300]/10 opacity-60 blur-[80px] pointer-events-none z-0" />

          <div className="w-full h-full z-10 relative cursor-grab active:cursor-grabbing">
            <Canvas
              shadows
              camera={{ position: [0, 1.2, 5.8], fov: 40 }}
              gl={{ antialias: true }}
            >
              <ambientLight intensity={darkMode ? 1.0 : 1.6} />
              <directionalLight
                position={[5, 10, 5]}
                intensity={darkMode ? 1.2 : 1.8}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              <pointLight
                position={[-5, 5, -5]}
                intensity={darkMode ? 2.5 : 1.2}
                color={darkMode ? "#45d300" : "#ffffff"}
              />

              <Suspense
                fallback={
                  <Html center>
                    <img
                      src={heroMascot}
                      alt="Lantech English Mascot Loading Fallback"
                      className="select-none pointer-events-none w-[320px] md:w-[480px] opacity-70 animate-pulse object-contain"
                    />
                  </Html>
                }
              >
                <MascotModel darkMode={darkMode} />
                <mesh
                  rotation={[-Math.PI / 2, 0, 0]}
                  position={[0, 0, 0]}
                  receiveShadow
                >
                  <planeGeometry args={[100, 100]} />
                  <shadowMaterial opacity={darkMode ? 0.35 : 0.15} />
                </mesh>
              </Suspense>

              <OrbitControls
                enableZoom={false}
                enablePan={false}
                target={[0, 1.2, 0]}
                minPolarAngle={Math.PI / 2.5}
                maxPolarAngle={Math.PI / 1.8}
                minAzimuthAngle={-Math.PI / 4}
                maxAzimuthAngle={Math.PI / 4}
              />
            </Canvas>
          </div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="features">
        {[
          {
            icon: <Map className="w-8 h-8 text-[#45d300]" />,
            iconBg: "bg-[#e8fcdb] dark:bg-green-950/20",
            title: t("landingFeat1Title"),
            desc: t("landingFeat1Desc"),
          },
          {
            icon: <Layers className="w-8 h-8 text-[#CE82FF]" />,
            iconBg: "bg-purple-50 dark:bg-purple-950/20",
            title: t("landingFeat2Title"),
            desc: t("landingFeat2Desc"),
          },
          {
            icon: <Bot className="w-8 h-8 text-[#1CB0F6]" />,
            iconBg: "bg-sky-50 dark:bg-sky-950/20",
            title: t("landingFeat3Title"),
            desc: t("landingFeat3Desc"),
          },
          {
            icon: <Mic className="w-8 h-8 text-[#6366f1]" />,
            iconBg: "bg-indigo-50 dark:bg-indigo-950/20",
            title: t("landingFeat4Title"),
            desc: t("landingFeat4Desc"),
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            whileHover={{
              y: -6,
              scale: 1.02,
              borderColor: "#45d300",
              boxShadow: darkMode
                ? "0 12px 30px rgba(0,0,0,0.4)"
                : "0 18px 50px rgba(15,23,42,0.12)",
            }}
            whileTap={{ scale: 0.98 }}
            className="feature-card flex flex-col items-start cursor-pointer transition-all duration-200"
          >
            {/* Styled Icon */}
            <div
              className={`p-4 rounded-[20px] ${feature.iconBg} mb-6 flex items-center justify-center w-fit`}
            >
              {feature.icon}
            </div>
            {/* Title */}
            <h3 className="text-[#101827] dark:text-foreground font-black text-xl mb-3">
              {feature.title}
            </h3>
            {/* Description */}
            <p className="text-[#6b7280] dark:text-muted-foreground text-base leading-relaxed">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#dfe3ea] bg-[#fbfbf7] dark:bg-background z-10">
        <div className="w-full max-w-[1320px] mx-auto px-6 sm:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[#6b7280] dark:text-muted-foreground font-semibold">
            {t("rightsReserved")}
          </div>
          <div className="flex items-center gap-6">
            <motion.button
              onClick={() => handleEnterAuth("login", "ranger")}
              whileHover={{ scale: 1.05, color: "#f472b6" }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer text-xs text-pink-500 font-bold hover:underline bg-none border-none"
            >
              {t("landingDemoAdmin")}
            </motion.button>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#45d300] inline-block animate-pulse" />
              <span className="text-sm text-[#6b7280] dark:text-muted-foreground font-semibold">
                {t("landingServerStatus")}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
