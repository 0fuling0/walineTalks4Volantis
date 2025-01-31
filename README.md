# walineTalks4Volantis
 用Waline的api实现了一个说说及发布说说的界面，感觉没什么用。

适配了点赞通知，样式，发布说说页面，侧边栏小组件等。

## 机理和功能
- 使用Waline的api，重建一个基于Waline的说说界面。通过api调取/talks/new/页面的Waline评论，这样只要在/talks/new/页面发布评论，就能成为显示在/talks/页面的说说。
- 新建说说页面的保密问题：
-- 1、在source/talks/index.md中可以配置是否只显示管理员评论，这样就算有人在/talks/new/页面发评论，也只能显示自己发的评论。
-- 2、Volanis主题兼容"hexo-blog-encrypt"，可以安装此插件，加密/talks/new/页面。
- 适配了Volanis主题点赞通知。
- 有一个控制面板，可以控制头像，位置，设备信息的显示与否。信息的默认开关情况、是否显示控制面板可以在在source/talks/index.md里进行配置。
- 加上了容器查询，这样在说说作为volantis的侧边栏组件显示时，不会太难看。

## 引入方法
由于是使用waline的api实现的，理论上只要有一个waline的服务链接，所有的hexo博客都能使用。

将所需文件放进`/source/talks/`文件夹，目录结构如下：
TALKS
├── new
│   ├── index.md
├── index.md
├── talks.css
├── talks.js

打开/talks/index.md
将其中的 serverURL 改为你的 Waline 链接。

```markdown source/talks/index.md 配置信息
window.TALKS_CONFIG = {
    // Waline服务设置
    serverURL: 'https://waline.fuling.me', // waline服务地址
    path: '/talks/new/',
    pageSize: 3,  // 每页加载数量
    adminOnly: true,  // 添加仅限管理员模式配置

    // 控制面板设置
    showControlPanel: true,  // 是否显示控制面板
    defaultSettings: {       // 控制面板默认状态
        avatar: false,       // 头像显示
        label: false,        // 标签显示
        device: true,       // 设备信息
        location: true      // 地址信息
    }
};
```


示例网站：[闲言碎语 - 迷宫间隙](https://www.fuling.me/talks/)


## 侧边栏小组件

volantis的通用页面部件功能，可以将talks页面当成小部件渲染显示出来。

```blog/_config.volantis.yml
sidebar:
  position: right # left right
  # 主页、分类、归档等独立页面
  for_page: [blogger, announcement, webinfo, qexot] #category, tagcloud, blogger,
  # layout: docs/post 这类文章页面
  for_post: [blogger, toc]
  # 侧边栏组件库
  widget_library:
    qexot:
      class: page
      header:
        icon: fa-solid fa-comment
        title: 闲言碎语    
      display: [desktop, mobile]
      pid: qexot
      content: content
```

只需要设置小部件里的 `pid` 属性和文章的 `front-matter` 中设置一样的 `pid` 即可。（这里设置为pid: qexot）
