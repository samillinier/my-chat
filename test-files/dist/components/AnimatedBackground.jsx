"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AnimatedBackground;
const react_1 = require("react");
const ClientOnly_1 = __importDefault(require("./ClientOnly"));
function AnimatedBackground({ children }) {
    const vantaRef = (0, react_1.useRef)(null);
    const effectRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const loadScripts = async () => {
            try {
                // Load Three.js
                const threeScript = document.createElement('script');
                threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
                document.head.appendChild(threeScript);
                await new Promise((resolve) => {
                    threeScript.onload = resolve;
                });
                // Load Vanta.js
                const vantaScript = document.createElement('script');
                vantaScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/vanta/0.5.24/vanta.dots.min.js';
                document.head.appendChild(vantaScript);
                await new Promise((resolve) => {
                    vantaScript.onload = resolve;
                });
                // Initialize Vanta effect
                if (vantaRef.current && !effectRef.current && window.VANTA) {
                    console.log('Initializing Vanta effect...');
                    effectRef.current = window.VANTA.DOTS({
                        el: vantaRef.current,
                        mouseControls: true,
                        touchControls: true,
                        gyroControls: false,
                        minHeight: 200.00,
                        minWidth: 200.00,
                        scale: 1.00,
                        scaleMobile: 1.00,
                        color: 0x00ff88,
                        color2: 0x000a04,
                        backgroundColor: 0x001a0e,
                        size: 1.90,
                        spacing: 29.00,
                        showLines: true
                    });
                    console.log('Vanta effect initialized successfully');
                }
            }
            catch (error) {
                console.error('Failed to initialize Vanta:', error);
            }
        };
        loadScripts();
        return () => {
            if (effectRef.current) {
                console.log('Cleaning up Vanta effect');
                effectRef.current.destroy();
                effectRef.current = null;
            }
        };
    }, []);
    return (<ClientOnly_1.default>
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#001a0e] to-black">
        <div ref={vantaRef} className="absolute inset-0" style={{
            opacity: 0.8,
            mixBlendMode: 'lighten'
        }}/>
      </div>
      {children}
    </ClientOnly_1.default>);
}
