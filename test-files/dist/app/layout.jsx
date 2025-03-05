"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
require("./globals.css");
const google_1 = require("next/font/google");
const ClientLayout_1 = __importDefault(require("@/components/ClientLayout"));
const inter = (0, google_1.Inter)({ subsets: ['latin'] });
exports.metadata = {
    title: 'Jasmine AI',
    description: 'Your AI Assistant',
};
function RootLayout({ children, }) {
    return (<html lang="en">
      <body className={`${inter.className} bg-[#001a11]`}>
        <ClientLayout_1.default>
          {children}
        </ClientLayout_1.default>
      </body>
    </html>);
}
