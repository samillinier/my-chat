"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ClientLayout;
const ClientOnly_1 = __importDefault(require("./ClientOnly"));
function ClientLayout({ children, }) {
    return (<ClientOnly_1.default>
      {children}
    </ClientOnly_1.default>);
}
