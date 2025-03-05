"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const outline_1 = require("@heroicons/react/24/outline");
const HamburgerMenu = ({ onClick }) => {
    return (<button onClick={onClick} className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#052e1f] hover:bg-[#0a1f15] transition-colors duration-200" aria-label="Toggle menu">
      <outline_1.Bars3Icon className="h-6 w-6 text-[#00ff88]"/>
    </button>);
};
exports.default = HamburgerMenu;
