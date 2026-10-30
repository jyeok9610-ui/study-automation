import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
 testDir:'./tests/browser',timeout:45000,fullyParallel:false,workers:1,
 use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure'},
 projects:[{name:'desktop',use:{browserName:'chromium',viewport:{width:1365,height:900}}},{name:'mobile',use:{browserName:'chromium',viewport:{width:390,height:844},isMobile:true,hasTouch:true}},{name:'webkit-desktop',use:{...devices['Desktop Safari'],viewport:{width:1440,height:900}}},{name:'webkit-mobile',use:{...devices['iPhone 13']}}],
 webServer:{command:'npm run dev',url:'http://127.0.0.1:4173',reuseExistingServer:true,timeout:30000}
});
