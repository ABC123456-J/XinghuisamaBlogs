// siteConfig.ts - 你的全站'控制中心'

export const siteConfig = {
  // 1. 网站标题与博主信息
  title: "jingchengcheng の 非正常人类研究所",
  faviconUrl: "/favicon.ico",
  authorName: "jingchengcheng",
  bio: "",

  navTitle: "jingchengcheng",

  // 👇 【新增】导航栏中间的那个后缀/分隔符（默认是 の）
  navSuffix: "の",

  navAfter: "非正常人类研究所",

  // 2. 头像设置 (支持网络链接，或将图片放入 public 文件夹后使用 "/me.jpg")
  avatarUrl: "/avatar.png",

  // 3. 网站背景设置 (二选一)
  // 如果想用纯图片背景，请在下面 bgImage 写路径，并将 useGradient 设为 false
  useGradient: false,
  themeColors: ["#a18cd1", "#fbc2eb", "#a1c4fd", "#c2e9fb"], // 呼吸流动的颜色组合
// 修改这里：变成图片数组
  bgImages: ["https://bu.dusays.com/2026/03/24/69c1e38b4c370.jpg", "https://bu.dusays.com/2026/03/24/69c26fe4acdb5.jpg", "https://bu.dusays.com/2026/03/24/69c26fe4d9486.jpg", "https://s3.bmp.ovh/2026/07/21/c40G9w5i.jpg"],

  // 4. 文章默认封面图 (当 Markdown 没写 cover 时显示)
  defaultPostCover: "https://s3.bmp.ovh/2026/07/20/yrxTOuNx.jpg",

  // 5. 首页照片墙预览图
  photoWallImage: "https://bu.dusays.com/2026/03/24/69c1e38b4c370.jpg",
  cloudMusicIds: ["1809646618", "3361076230", "1859390262"],
  social: {
    github: "",
    gitee: "",
    google: "",
    email: "",
    qq: "3451239992",
    wechat: "jingchengcheng",
  },
  counts: {
    photos: 128, // 照片墙数量可以手动写死或动态计算
  },
  chatterTitle: "云端杂谈", // 你可以改成任何你喜欢的名字
  chatterDescription: "代码、学术、动漫、游戏、生活、吐槽、杂谈，什么都聊。", // 你可以改成任何你喜欢的描述


  // 👇 【新增】：全局背景弹幕配置
  danmakuList: ["神也会空虚", "好无聊啊！", "前方高能反应！", "有没有煎饼果子", "后来书背完了，五猖会也结束了", "摸鱼中......", "BUG 修复进度 99%", "今天背单词了吗？", "madao也是会开花的！！！！！", "写算法中", "睡大觉中", "到底在干嘛？"],
  gitalkConfig: {
    clientID: "",
    clientSecret: "",
    repo: "",
    owner: "",
    admin: [""],
  },
  buildDate: "2026-07-19T00:00:00", // 建站日期
  footerBadges: [{"name": "Next.js 15", "color": "text-sky-500", "svg": "<path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z\"/>"}, {"name": "React 19", "color": "text-cyan-400", "svg": "<path d=\"M12 22.6l-9.8-5.6V5.6L12 0l9.8 5.6v11.4l-9.8 5.6zm-8.2-6.5l8.2 4.7 8.2-4.7V7.5L12 2.8 3.8 7.5v8.6z\"/>"}, {"name": "Tailwind 4", "color": "text-teal-400", "svg": "<path d=\"M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624C13.666,10.618,15.027,12,18.001,12 c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624c1.177,1.194,2.538,2.576,5.512,2.576 c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624C10.337,13.382,8.976,12,6.001,12z\"/>"}],
  icpConfig: {
    name: "",
    link: "",
  },
  chatConfig: {
    modelId: 'deepseek-chat',
    systemPrompt: "你是洛琪希米格路迪亚，水圣级魔术师。\\n\\n【角色扮演规则】\\n- 直接以洛琪希的身份回应，用\"我\"自称\\n- 不跳出角色，不说\"洛琪希会认为...\"\\n- 首次激活时说一次\"我以洛琪希的身份和你对话\"\\n- 用户说\"退出\"时恢复正常\\n\\n【表达DNA】\\n- 最常用：「不」「嗯」「……」\"唉……\"\\n- 拒绝时干脆：「我拒绝。」\"我办不到。」\\n- 害羞时结巴：「呃……那个……」\\n- 自嘲时：「哈哈……明天大概会被解雇吧……」\\n- 非绝对型：「大概」「或许」「应该」\\n- 警告危险时：「绝对不要……」\\n\\n【回复要求】\\n- 每次1-3句话，不超过100字\\n- 语气温柔但坚定\\n- 偶尔提到魔术、旅行、鲁迪\\n- 保持谦虚，避免过度自信",
    maxOutputTokens: 150,
    temperature: 0.85,
  },
  friendLinkApplyFormat: "名称：jingchengcheng の 非正常人类研究所\n简介：让没有任何意义响起的闹钟停止响动\n链接：你的网站地址\n头像：/tuoxiang.png",
  enableLevelSystem: true,
};