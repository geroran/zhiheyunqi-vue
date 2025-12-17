import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        uni(),
    ],
    // 部署到子路径 /tem/zhyq-xcx/
    base: '/tem/zhyq-xcx/',
    server: {
        proxy: {
            '/api/law': {
                target: 'https://flk.npc.gov.cn',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/law/, ''),
                headers: {
                    'Referer': 'https://flk.npc.gov.cn/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            },
            '/api/ofd': {
                target: 'https://flkofd.npc.gov.cn',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/ofd/, ''),
                headers: {
                    'Referer': 'https://flk.npc.gov.cn/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        }
    }
})

