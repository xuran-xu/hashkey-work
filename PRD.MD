好的，没问题。这是一份为AI代码生成器准备的产品需求文档 (PRD)，描述了您想要的词汇表网站功能。

产品需求文档 (PRD): 交互式词汇表网站

1. 项目概述

1.1. 目标: 开发一个单页面、交互式的词汇表（词典）网站。用户可以浏览词汇卡片网格，点击某个词汇后，页面布局会动态调整，展示该词汇的详细内容。

1.2. 核心用户流:
1. 用户访问网站，看到词汇表以网格形式展示。
2. 用户可以通过类别筛选或搜索来快速定位词汇。
3. 用户点击感兴趣的词汇卡片。
4. 页面布局平滑过渡：左侧收缩为词汇目录列表，右侧滑出显示所选词汇的详细内容面板。
5. 用户阅读详细内容。
6. 用户点击内容面板上的"返回/收起"箭头。
7. 页面布局平滑恢复：内容面板滑回隐藏，左侧目录列表扩展回初始的词汇网格视图。

2. 功能需求

2.1. 初始视图 (页面加载时)
* 布局:
* 最顶层中心放置logo C:\Users\Aurora\dev-document\Chain-横-黑字.png
* 顶部控制区域：
  * 位置：网格区域的正上方，与网格等宽
  * 左侧：类别筛选下拉菜单
  * 右侧：搜索框
  * 两个控件之间保持适当间距，确保视觉平衡
* 采用全宽度的网格 (Grid) 布局展示所有词汇条目。
* 每行固定显示 4 个词汇卡片。
* 网格应具有响应性，在不同屏幕宽度下能自动调整卡片间距或布局（但优先保证每行4个，除非屏幕过窄无法容纳）。
* 词汇卡片:
* 每个词汇卡片代表一个词汇条目。
* 同一个词汇卡片分为上下两层
* 词汇上层应该较为明显，颜色为主色调，至少包含词汇的标题/名称。
* 词汇卡片下层内可包含该词汇的简短描述预览,最多只显示50个字,并且字体较小，颜色为辅助色
* 初始视图应该只包含词汇卡片，而不含该词汇的详细定义
* 卡片整体为可点击区域。
* 外观: 参照第 3 节 UI/UX 设计要求。

2.2. 类别筛选功能
* 位置：词汇网格区域左上方
* 外观：
  * 下拉菜单样式
  * 使用与整体设计风格一致的紫色主题
  * 当前选中的类别应该明显区分
* 功能：
  * 默认显示"全部类别"
  * 点击展开显示所有可用类别（包括 tech、finance、wallet_identity、nft_metaverse、governance、other）
  * 选择某个类别后，网格中只显示该类别的词汇卡片
  * 切换类别时，需要平滑的过渡动画（卡片淡入淡出效果）
* 交互：
  * 鼠标悬停时显示轻微的背景色变化
  * 点击展开下拉列表
  * 选择类别后自动收起下拉列表
  * 当处于筛选状态时，下拉菜单应显示当前选中的类别
* 响应式：
  * 在移动端可考虑改为全宽下拉列表或其他适合触摸操作的形式

2.3. 搜索功能
* 位置：词汇网格区域右上方
* 外观：
  * 搜索框应该足够明显，但不喧宾夺主
  * 包含搜索图标和输入框
  * 边框和图标使用主题紫色
  * 适当的圆角设计
* 功能：
  * 实时搜索（输入时即时过滤显示匹配的词汇）
  * 搜索范围：词汇标题
  * 支持模糊匹配
  * 当有搜索内容时，在搜索框右侧显示清除按钮
* 交互：
  * 输入框获得焦点时显示轻微的阴影效果
  * 输入时即时显示匹配结果
  * 点击清除按钮可快速清空搜索内容
  * 搜索结果为空时显示"无匹配结果"的提示
* 键盘支持：
  * 按 Enter 键可以触发搜索
  * 按 Esc 键可以清空搜索框
* 响应式：
  * 在移动端可考虑使用全屏搜索模式

2.4. 激活词汇视图 (点击词汇卡片后)
* 触发: 用户点击初始视图中的任意一个词汇卡片。
* 左侧区域 (原网格区域):
* 动画: 必须有平滑（丝滑）的过渡动画效果。
* 布局: 整个网格区域收缩变窄，固定在页面左侧，转变为一个垂直的目录列表。
* 内容: 列表仅显示所有词汇的标题/名称。
* 交互:
* 列表项（词汇名称）应可点击，用于切换右侧面板显示的内容。
* 如果词汇列表过长，该区域应允许垂直滚动。
* 当前在右侧面板中显示的词汇，在左侧列表中应有视觉上的高亮或区分。
* 右侧区域 (内容面板):
* 动画: 必须有平滑（丝滑）的从右侧滑入的动画效果，与左侧区域的收缩同步进行。
* 布局: 占据页面剩余的主要宽度。
* 内容:
* 每个词汇的内容需要填充对应的md文件 比如blockchain 添加地址为C:\Users\Aurora\dev-document\content\blockchain.md
* 清晰地显示被点击词汇的完整标题/名称。
* 展示该词汇的详细定义、解释或其他相关内容。
* 如果内容过长，该区域应允许独立垂直滚动。
* 交互:
* 伸缩按钮:
* 在右侧区域 (内容面板)的左侧边缘，即为左侧区域的右侧边缘，需要一个明显的紫色箭头图标（例如 < 或类似的向左箭头）作为"收起/返回"按钮，箭头参考C:\Users\Aurora\dev-document\images.jpg，位置放置在边缘中心处
* 点击此箭头按钮，触发页面恢复到初始视图。
* 视图切换:
* 当用户处于"激活词汇视图"时，点击左侧目录列表中的另一个词汇名称，右侧内容面板应更新为新选词汇的内容（可以仅更新内容，无需完整的滑出再滑入动画，或者使用淡入淡出等轻量动画）。左侧列表中的高亮状态也应随之更新。

2.5. 返回初始视图 (点击伸缩按钮后)
* 触发: 用户点击右侧内容面板上的"收起/返回"箭头按钮。
* 动画: 必须有平滑（丝滑）的过渡动画效果。
* 右侧区域 (内容面板): 平滑向右滑出直至隐藏。
* 左侧区域 (目录列表): 平滑扩展恢复为初始的全宽度词汇网格布局。

3. UI/UX 设计要求

3. UI/UX Design Requirements
Overall Inspiration: The visual design, including colors, typography, and component styling, should closely mirror the look and feel of the documentation site https://documentation-1oqt.vercel.app/docs/Build-on-HashKey-Chain/Tools/Safe. The goal is a clean, modern, and professional appearance with a distinct purple/violet theme. Use of CSS Variables (Custom Properties) for colors, fonts, and spacing is highly recommended for maintainability.

3.1. Color Palette (Derived from Reference & User Feedback)

Primary Interactive Color: #9f80e0 (Deep Lilac / Muted Purple)
Analysis: Selected after feedback indicated #a88beb felt too vivid. This shade (#9f80e0) is darker and less saturated, closely matching the calm purple of the card headers in the reference screenshot (input_file_0.png) while fulfilling the "less vivid" requirement.
Use Case: Main visual color for card headers (upper layer), active states (sidebar/list highlight), focus rings/shadows, key icons (search, dropdown arrow). Offers adequate contrast with white text for large header sizes.
Primary Light / Hover Background: #e1d7f5 (Very Light Purple/Lilac)
Analysis: This very light shade complements #9f80e0 well for hover and subtle backgrounds.
Use Case: Background for hovered list items, subtle card hover backgrounds, selected dropdown options background.
Text Color (Body): #374151 (Cool Gray 700)
Use Case: Default text color for paragraphs.
Text Color (Headings): #111827 (Gray 900) or #000000 (Black)
Use Case: Content panel title (h2). Note: Card headers use white text on the primary color background.
Text Color (Subtle/Descriptions): #6B7280 (Cool Gray 500)
Use Case: Short descriptions on cards (lower layer).
Background Color (Main Content Area): #FFFFFF (White)
Use Case: Background for card lower layers, main content panel.
Background Color (Page/Controls Area): #F8FAFC (Slate 50) or #F9FAFB (Gray 50)
Use Case: Overall page background, controls bar background.
Border Color: #E5E7EB (Cool Gray 200)
Use Case: Default borders for cards, inputs, dropdowns.
Focus Ring / Shadow: Use the Primary Interactive Color (#9f80e0). Example: box-shadow: 0 0 0 3px rgba(159, 128, 224, 0.4); or outline: 2px solid #9f80e0; outline-offset: 2px;.
Accessibility: Ensure all final color combinations meet WCAG AA contrast standards. As noted, White on #9f80e0 is suitable for the large text format of the headers.


3.2. Typography (Derived from Reference)
Primary Font Family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol" (or a very similar modern sans-serif stack). Inter appears dominant on the reference. Use a web font service (@import) if necessary.
Base Font Size: 14px (The reference site appears to use 14px as a base for body text).
Base Line Height: 1.7 or 1.75 (Generous line height for readability).
Headings:
font-family: Same as primary.
font-weight: 600 (Semibold) or 700 (Bold).
color: #111827 or #000000.
font-size (Examples, adjust as needed for visual hierarchy):
h1 (Page Title - if any): 24px - 30px
h2 (Content Panel Title): 20px - 22px
h3 (Card Title): 16px
Card Short Description:
font-size: 12px or 13px.
color: #6B7280.
Consistency: Apply typography styles globally and consistently across all elements.
3.3. Spacing & Layout Units
Base Unit: Use a consistent spacing scale, likely based on 4px increments (common in frameworks like Tailwind CSS used by the reference site).
Examples: 4px, 8px (0.5rem), 12px (0.75rem), 16px (1rem), 20px, 24px (1.5rem), 32px (2rem).
Padding:
Card Padding: 16px (p-4).
Content Panel Padding: 24px or 32px (p-6 or p-8).
List Item Padding (Left List View): 8px 12px (py-2 px-3).
Input/Select Padding: 8px 12px (py-2 px-3).
Margins: Apply consistent margins between elements (e.g., heading and paragraph: 16px, mb-4).
Grid Gap: Initial grid gap 16px or 20px.
3.4. Borders & Shadows
Border Radius: 6px or 8px (rounded-md or rounded-lg) for cards, inputs, selects, buttons.
Borders: Default 1px solid #E5E7EB.
Box Shadow: Use subtle shadows for cards on hover or for focused elements. Example: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) (subtle shadow), 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) (slightly stronger hover/focus shadow). Focus shadow should incorporate the primary color.
3.5. Animation Effects
Smoothness: Emphasize "silky smooth" transitions using CSS transition.
Properties: Transition transform, opacity, width, background-color as needed.
Duration: 0.2s to 0.3s (faster than 0.5s often feels more responsive for UI).
Timing Function: ease-in-out.
Specific Animations:
Grid Collapse / List Expand: Animate width of the container and potentially use Flexbox/Grid properties.
Panel Slide: Use transform: translateX(...) for the right panel.
Card Filtering: Fade-in/Fade-out (opacity, possibly slight transform: translateY) for appearing/disappearing cards.
List Item Update (Content Panel): Use subtle background-color fade for hover/active states. Content update can be instant or use a very quick fade (opacity).
3.6. Component-Specific Styling
Logo: Position top-center as requested. Ensure clear space around it. Path: C:\Users\Aurora\dev-document\Chain-横-黑字.png.
Controls (Filter/Search): Place above grid. Use specified padding, border, radius, colors.
Select Dropdown: Style to match reference (likely needs custom styling or minimal default), use SVG background for dropdown arrow using primary color (#7C3AED). Hover background: #EDE9FE. Focus: Border #7C3AED and/or focus shadow.
Search Input: Style with padding, border, radius. Add search icon (#7C3AED) on the left inside the padding area. Focus state same as select. Clear button (X) on the right when input has value.
Vocabulary Cards:
Structure: Two layers required.
Upper Layer: Background #7C3AED, text color #FFFFFF (or a high-contrast light color), padding ~12px, font-weight: 600.
Lower Layer: Background #FFFFFF, text color #374151 / #6B7280, padding ~12px, border 1px solid #E5E7EB (except top). font-size: 12px/13px for description. Truncate description (e.g., using -webkit-line-clamp: 2).
Overall Card: border-radius: 8px, subtle box-shadow on hover/focus, cursor: pointer.
Active View Left List:
Background: #FFFFFF or #F8FAFC.
Items: Padding 8px 12px. Text color #374151.
Active Item: Background #EDE9FE, text color #7C3AED (or darker text #111827 if preferred), potentially a border-left: 2px solid #7C3AED.
Content Panel: Background #FFFFFF. Padding 24px or 32px. Standard heading/paragraph styling as per Typography section.
Retract/Slide Arrow Button:
Position: Fixed or absolute to the left edge of the content panel, vertically centered.
Appearance: Needs custom styling. Use an SVG icon for the left-pointing arrow (reference: C:\Users\Aurora\dev-document\images.jpg - ensure AI uses a standard SVG arrow).
Background: Transparent or very light grey by default. On hover: #EDE9FE or slightly darker.
Icon Color: #7C3AED.
Size: ~32x32px or 40x40px tappable area. border-radius: 50% or square with rounded corners.
3.7. Responsive Design
Adapt grid columns (e.g., 4 -> 2 -> 1).
Adjust panel/list width split ratios for tablets/mobiles (e.g., Panel 60%/List 40%, Panel 100%/List hidden or overlay).
Ensure controls (filter/search) stack appropriately or adjust width on smaller screens.
Optimize padding and font sizes slightly for mobile if needed.

4. 非功能性需求

4.1. 性能: 页面加载速度快，动画流畅不卡顿。
4.2. 浏览器兼容性: 兼容主流现代浏览器最新版本 (Chrome, Firefox, Safari, Edge)。
4.3. 可访问性 (Accessibility):
* 考虑键盘导航：
  * 用户应能使用 Tab 键在词汇卡片/列表项间导航
  * 使用 Enter 键激活词汇
  * 使用 Escape 键关闭内容面板
  * 类别筛选和搜索框应支持完整的键盘操作
* 确保颜色对比度符合 WCAG 标准
* 使用语义化 HTML 标签
* 为所有控件添加适当的 ARIA 标签
* 搜索和筛选结果的更新应该通过 ARIA live regions 通知屏幕阅读器

5. 内容管理

5.1. 数据结构: 每个词汇条目应包含以下信息：
* id: 唯一标识符 (例如 term1, blockchain_basics)
* type: 词汇类别 (例如 tech, finance 等)
* title: 词汇名称/标题 (例如 "词汇 1", "区块链")
* short_description (可选): 用于初始网格卡片显示的简短描述
* full_content: 用于在右侧面板显示的详细内容 (可以是 HTML 字符串，支持段落、列表、加粗等格式)
* icon_or_image_placeholder (可选): 用于卡片的图标标识或图片 URL

5.2. 数据来源:
* 初期开发阶段，词汇数据可以硬编码在 JavaScript 文件中（例如一个对象数组）。
* AI 应设计代码结构，以便未来容易将数据源切换为外部 JSON 文件或 API 接口。

6. 技术栈建议

前端基础: HTML5, CSS3, JavaScript (ES6+)。

布局技术: 建议使用 CSS Grid 实现初始网格布局，使用 Flexbox 或 Grid 实现激活视图的左右布局。

无需特定的前端框架 (如 React, Vue, Angular)，除非另有说明。使用原生技术即可。

7. 注意事项与补充说明

重点强调动画的"丝滑感": 这是用户体验的关键，请 AI 在 CSS 实现上特别注意性能和缓动效果。

伸缩按钮的位置和样式: 明确要求在内容面板的左侧边缘，使用箭头图标。

字体参考: 明确要求 AI 分析 https://docs.hsk.xyz/ 的字体应用。

初始布局: 再次强调初始是 4 列网格，不是一开始就左侧列表右侧空白。

代码注释: AI 生成的代码应包含必要的注释，解释关键逻辑和 CSS 规则。

请将此文档提供给 AI 代码生成器，它应该能根据这些详细需求生成相应的 HTML, CSS, 和 JavaScript 代码。