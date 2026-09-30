# 兔兔末日 — 開發與交付紀錄

## 交付狀態

依據小語提供的《兔兔末日》企劃草案 v1 與決議 #1–#25，完整遊戲已實作，可在本機 HTTP 或靜態網站執行；不是只有企劃、灰盒或單關展示。

- CNAME：`bunnydoom.ysgs.app`，已先獨立提交 `80693ea` 並推送 `main`。
- 實際倉庫：<https://github.com/YuStellarGamesStudio/BunnyDoom>。
- 遊戲、資產、測試與部署工作流程依功能分組提交於本機；尚未推送遊戲提交或觸發正式部署。
- 正式目標：<https://bunnydoom.ysgs.app/>。CNAME 已推送不代表 Pages、DNS 或 HTTPS 已上線；本輪未修改 DNS／Pages 設定。
- 最後驗證的 production build：`0cb799bb0d85e8c37333`，117 個 precache 資源。

## 1. 執行方式

需要 Node.js 22 以上。無 npm 相依套件，不需要先執行 `npm install`。

```sh
npm run dev
```

開啟 <http://127.0.0.1:4173/>。支援 `?lang=zh`、`?lang=en`、`?lang=ja`。不要直接以 `file://` 開啟，Worker、AudioWorklet 與 Service Worker 需要 HTTP／HTTPS。

```sh
npm test
npm run build
npm run assets:check
PORT=4174 npm run preview
```

正式打包預覽：<http://127.0.0.1:4174/>。開發入口不註冊 PWA；離線與版本更新請使用 `dist/` 預覽。

操作：點擊／觸控洞位打兔子、點擊掉落物使用道具、按必殺鍵手動施放；`P`、`Esc` 或暫停鍵暫停。分頁隱藏時自動暫停，返回不補算離開期間的時間。

## 2. 已完成範圍

| 階段 | 已實作內容 |
| --- | --- |
| 1．專案與介面 | 原生 HTML／CSS／ES modules、開頭、操作說明、設定、三語即時切換、URL／History 語系、PWA 殼、AGPL 原始碼入口 |
| 2．戰鬥核心 | 3×3 洞陣、倒數、冒出／停留／縮回、命中／漏兔、COMBO、暴擊、時間、單次結算、暫停、兩點擊重試 |
| 3．完整戰役 | 東京／巴黎／紐約／開羅／南極／月球；54 普通關＋6 BOSS；世界地圖、進度鎖定、BOSS 技能與 180 秒狂暴、三語劇情與結算台詞、Top 10 |
| 4．戰鬥擴充 | 普通／金／銀／假／炸彈兔、金兔保底、手動必殺、5 種消耗品、4 件被動裝備、掉落上限與增益時計 |
| 5．長線成長 | 3 支線各 5 技能、全樹 27 SP、前置條件、免費全額重置、24 件純外觀造型、解鎖門檻、1200×1200 PNG 肖像匯出 |
| 6．音訊 | 官方 OPM.js v1.1.0、12 首獨立 BGM JSON、12 種 SFX、4-op FM 即時合成、5 BGM＋3 SFX 聲部、音量與開關、手勢啟動 |
| 7．正式整合 | 分層 SVG 與高解析共用圖集、真正的 WebGPU sprite pipeline、Canvas 2D＋Worker 回退、device-loss 戰局保留、RWD、完整存檔、離線打包、手動 Pages 工作流程 |

沒有多人、雲端排行、帳號、真 3D、語音、內購、成就、關卡編輯器或無盡模式；這些原本即不在企劃範圍。

## 3. 規則交互作用的實作選擇

保留原稿明確的目標分、倍率、技能數值與達標即過關，不為展示結果加入作弊分支。以下補足原稿未定義或互相衝突的部分：

1. **早期關卡與三星：** 三個星標準是通關、最高 COMBO ≥30、漏兔 ≤2；後兩項只在通關時成立。首關可能在 30 COMBO 前已達標，因此不保證每關都能三星。沒有暗改目標、延遲結算或降低 COMBO 門檻。
2. **SP：** 每關只發「本次星數高於歷史最佳的差額」，最多 3 SP。不同場次的條件不合併成額外星數，重刷不能刷出無限 SP。
3. **金兔：** 進行中的關卡在經過 3／11／19／27 秒安排前四隻金兔保底；保底優先於隨機替換。提前通關即結束，不強留玩家等待必殺體驗。
4. **BOSS：** 以 HP 歸零過關，不套普通關的時間歸零失敗或剩餘秒數加分，因此 180 秒狂暴確實可觸發。普通點擊基礎傷害 1，必殺基礎傷害 10。
5. **技能解讀：** B1 為金兔充能增量 ×1.25；B3 為必殺得分與 BOSS 傷害 ×1.3；B4 停止敵人及遊戲時計 2 秒、保留玩家輸入；B5 得分增益維持 5 秒。C4 為銀兔相對權重 ×1.15。
6. **結算順序：** 命中效果與 COMBO → 得分 → 判勝 → 判負；負分下限為零。重複增益刷新持續時間。渲染器不決定分數、亂數或獎勵。
7. **裝備重置：** 裝備三件時先要求卸下一件，才可重置回兩槽，不會靜默移除玩家裝備。
8. **外觀解鎖：** 星數、已擊敗世界 BOSS 數及「累計獲得 SP」作為門檻，不以可用 SP 餘額判斷。完整門檻與三語名稱集中在 `src/data/game.js`。
9. **語言優先序：** 有效 URL → 已儲存偏好 → 英文，不跟隨瀏覽器語言。語言入口與設定並列於頂部，設定內不再包含語言分頁；戰鬥中開啟語言選單會暫停。固定英文 OG metadata 不隨介面語系改寫。
   結算畫面提供「下載戰績卡」，通關與失敗皆可匯出 1200×630 PNG，包含世界背景、目前造型、關卡、星級、分數、最高連擊及漏兔數。文字採按下下載當時的中／英／日語系，檔名包含勝敗、關卡與語系；不影響固定英文 OG 分享圖。
10. **節奏目標：** 首世界 15–25 分鐘屬玩家節奏觀測目標，不靠延長轉場、強制重玩或改分數補時。下方的理想輸入模擬不能當作真人節奏證明。

## 4. 架構與維護入口

| 路徑 | 責任 |
| --- | --- |
| `app.js`、`index.html`、`assets/styles/app.css` | 畫面、輸入、場景生命週期、遊戲／音訊／儲存協調 |
| `src/core/game.js` | 可重現的遊戲狀態機、時計、碰撞、BOSS、道具與技能；可 serialize／restore |
| `src/data/game.js` | 六世界、關卡公式、兔子、裝備、道具、技能、造型與劇情 |
| `src/data/render.js`、`src/render/renderer.js` | 共用場景命令、WebGPU／Canvas、視覺時計、肖像匯出 |
| `src/workers/simulation.js` | CPU 模式的單一模擬 Worker；以 runId 丟棄舊戰局訊息 |
| `src/save/save.js` | 有界 schema 驗證、進度與 SP 經濟、JSON／Base64、匯入備份、排行 |
| `src/i18n/strings.js` | 中／英／日介面字典 |
| `src/audio/audio.js`、`src/data/audio.js` | OPM 排程、聲部與佇列管理、樂器、音效 |
| `assets/audios/` | 12 首 BGM JSON |
| `src/vendor/opm/` | 官方 release 的 API、worklet、chunks、Apache-2.0 授權與來源／checksum 紀錄 |
| `assets/art/`、`assets/atlases/` | SVG 原稿；WebP 圖集：384px sprite tiles、1024px 博美／兔王 tiles、2x 世界背景與舞台 |
| `assets/icons/`、`favicon.ico` | 安裝圖示、Apple touch、固定英文 1200×630 分享圖 `og.jpg` |
| `tools/generate-art.mjs`、`tools/art/`、`tools/rasterize-art.js`、`tools/art.html` | 向量資產生成（共用、世界、棋盤／特效、角色／造型模組）與瀏覽器光柵輸出工具 |
| `tools/hash-assets.mjs`、`sw.js`、`src/pwa.js` | 內容雜湊 release、完整 precache、保守升級 |
| `tests/` | Node 內建測試工具的核心與存檔回歸測試 |

玩法使用同一個 `Game`，WebGPU 模式在主執行緒模擬，CPU 模式在 Worker 模擬。GPU 失效時先序列化戰局，再以 Canvas／Worker 接續，不重新開局。兩條路徑共用 WebP 圖集，不以整張 Canvas 上傳冒充 WebGPU 繪製。

美術重新輸出：先執行 `node tools/generate-art.mjs`，開啟開發站的 `/tools/art.html`，將產生的 WebP 圖集、PNG 圖示與 `og.jpg` 按頁面路徑存回專案；若圖示改變，再執行一次生成器更新 ICO。最後重新 build。已交付完整生成資產，正常啟動與打包不需要重做美術輸出。

圖集與渲染約定：`hole`／`rim` 為 180×180、以洞口中心 1:1 繪製，`rim` 只含前緣並蓋在兔子前方；兔子以 126px 方格由上往下裁切冒出，不再垂直壓扁。圖集以 WebP（q=0.9）輸出，WebGPU 上傳為 premultiplied alpha 並建立完整 mipmap，Canvas 回退使用高品質平滑；遊戲 Canvas 後備緩衝依 devicePixelRatio 最高 2x。博美與兔王只存在 1024px hero 圖集。分享圖直接由英文標題插畫光柵化，OG／Twitter 標記含尺寸、型別與替代文字。

## 5. 存檔、安全與版本更新

- 正式資料鍵為 `bunnydoom-save-v1`，備份鍵為 `bunnydoom-save-backup`；存進度、最佳成績、SP、技能、裝備、造型、Top 10、統計與設定，不存 GPU／執行緒物件。
- JSON 與 Base64 匯入都經過大小、版本、型別、有限數值、範圍、技能前置、SP 守恆和關卡連續性驗證；只建立已知欄位。
- 匯入先預覽進度、星數與日期，確認後先成功備份舊檔，才替換新檔。匯入寫入失敗不替換目前的記憶體存檔；損毀舊檔不自動覆寫。
- 戰鬥中設定只改記憶體，不立即寫存檔；結束或離開戰局時儲存。局內不開放存檔匯入。
- `dist/releases/<content-hash>/` 保留完整相對路徑圖，涵蓋 app、Worker、OPM worklet／chunks、JSON 與全部美術，不依賴 Window import map。
- Build 為 HTML 的 app.js、CSS、圖示與 manifest 引用附加 `?={檔案內容 SHA-256 前 20 碼}`，離線 precache 同時收錄帶 hash 與原始 URL。模組內的相對引用仍由不可變 release 目錄版本隔離。
- 完整 precache 成功才安裝新版；不呼叫 `skipWaiting` 強迫接管進行中的戰局。關閉使用中的遊戲分頁後安全啟用，再保留一版舊快取。
- 只清理本遊戲快取前綴，不清 localStorage；精確匹配資產 URL。帶 `?lang=` 的離線導航回退入口文件，由介面解析語系。
- 無 CDN、錄音檔或執行時第三方服務依賴。專案 AGPL-3.0-only，OPM.js 保留原 Apache-2.0 授權。
- Git 僅忽略根目錄 `/dist/` 打包產物；`src/vendor/opm/dist/` 是必要的內附音訊 runtime，必須隨原始碼提交。

## 6. 已執行的驗證

以下是實際執行結果，不把純程式模擬、瀏覽器操作與實機驗收混在一起。

| 驗證 | 實際結果 |
| --- | --- |
| `npm test` | 22 項全部通過，0 失敗；包含核心與存檔／經濟邊界 |
| `npm run build`、`npm run assets:check` | 最終 build `0cb799bb0d85e8c37333`；117 個離線資源，內容 hash 檢查通過；圖集由 7.9 MB PNG 降為 1.6 MB WebP |
| 美術重繪實機檢視 | Chromium 中 WebGPU 與強制 Canvas 路徑皆實際繪製新圖集：洞口比例正確、兔子裁切冒出、BOSS 與血條正常；production 預覽確認 OG／Twitter 標記與 `og.jpg`、`.nojekyll` 輸出 |
| 真實引擎的 60 關固定種子模擬 | 60/60 通關，包含全部六兔王；無技能輸入。首關 19 次命中、2 星、10.3167 秒；最終 BOSS 221.77 秒，跨過狂暴門檻 |
| 同一模擬的存檔經濟 | 累計 164 SP，全部 24 件造型可解鎖；購買 15 技能花 27 SP，剩 137，schema 驗證通過 |
| 真實 Chromium 點擊普通關 | 強制 CPU Worker、手機版，20 次命中、5543 分、2 星、漏兔 0，下一關與 2 SP 寫入存檔；也走過失敗與重試 |
| 真實 Chromium 點擊 BOSS | 第一世界兔王通關，157 次命中、實際施放必殺、57432 分；中途 GPU device-loss 回退後接續戰局。此次包含先前等待造成的漏兔，不能當作完美操作成績 |
| WebGPU 與回退 | 實際 WebGPU pipeline 繪製；真正呼叫 GPUDevice.destroy 後切為 CPU＋Worker，保留暫停狀態、時間、HP 與能量；無 GPU validation error |
| 即時語言切換 | 中／英／日畫面、日文 URL 優先於已存中文；暫停戰鬥切換語言保留同一 Canvas 與模擬時間 |
| 配點與重置 UI | A1／A2 購買、重置退款；另驗證全樹三槽重置阻擋與日文提示、卸下一件後退款 27 SP，不遺失另外兩件裝備 |
| 存檔與排行 UI | Base64 匯出、匯入預覽、確認、原檔備份；三字元代號登錄。十名排行分成兩頁，短橫向全部可讀 |
| 正式肖像 | 真實匯出 Blob 為 image/png、1200×1200；向量資產直接光柵化，不放大小圖假裝高解析 |
| 音訊 | 真實 OPM AudioWorklet 輸出非零 PCM，走過 12 場景 BGM 與全部 SFX；聲部／佇列限制與手勢啟動已驗證。不是人工聽感認證 |
| RWD | 實際操作 360×640、390×844、667×375、844×390、1080×720、1920×1080；修正日文導覽、短橫向技能／圖鑑／裝備、結算裁切。所檢查選單與結算控制項均在畫面內，可用按鈕至少 44×44 |
| 離線與更新 | 實際由舊版升級、等待分頁離開後啟用；保留 60 關存檔，清理至新舊兩版快取。斷網重載並啟動月球兔王，CPU Worker 與 WebGPU 路徑均成功 |
| 最終 production smoke | 最終版本在 `navigator.onLine === false` 下顯示 WEBGPU、月球兔王 HP 320/320；errors 與 console 紀錄均為空 |

### 尚未宣稱通過的外部／實機驗收

- 真實 iOS／Android 裝置上的安裝 UI、工具列／safe-area、耗電及持續效能；Chromium viewport 模擬不等於真機。
- 耳機／喇叭的人工音質聽測；非零 PCM 不等於無爆音的主觀音質保證。
- 真人首次通關節奏與長時間平衡；理想輸入完整 60 關約 2153 秒，不代表真人時間。
- 正式網域的 Pages 發布、DNS、TLS 與社群爬蟲抓取。這些外部操作未執行。

## 7. 發布方式

`.github/workflows/pages.yml` 是手動 `workflow_dispatch`，不會因本機開發自動部署。要發布時：

1. 審閱並提交、推送遊戲原始碼及已生成資產。
2. 在 GitHub repository 的 Pages 設定選擇 GitHub Actions。
3. 手動執行 **Deploy Bunny Doom**；流程會測試、build、檢查 hash，再上傳並發布 `dist/`。
4. 由網域管理者確認 `bunnydoom.ysgs.app` 的 DNS 與 Pages HTTPS，再驗證正式網址和 OG 圖。

發布產物保留根目錄 CNAME、LICENSE、manifest、圖示與 `.nojekyll`（原始碼根目錄的 `.nojekyll` 由 build 複製）；不需要把 `dist/` 提交回原始碼分支。
