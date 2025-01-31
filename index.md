---
layout: docs
seo_title: 闲言碎语
title: 闲言碎语
top_meta: false
bottom_meta: false
pid: qexot
sidebar: [blogger, announcement, webinfo]  
---
<script>
// Waline配置
window.TALKS_CONFIG = {
    // Waline服务设置
    serverURL: 'https://waline.fuling.me',
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
</script>


<style>
/* Loading 动画样式 */
.walinet-inner, .walinet-loader {
    border-radius: 50%;
    position: absolute;
}

.walinet-loader {
    background-color: rgba(144, 147, 153, 0.1);
    width: 64px;
    height: 64px;
    perspective: 800px;
}

.walinet-inner {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
}

.walinet-part {
    margin-top: 20px;
    min-height: 100px;
}

.walinet-loading {
    margin-bottom: 20px;
}

.walinet-inner.one {
    left: 0;
    top: 0;
    animation: rotate-one 1.6s ease-in-out infinite;
    border-bottom: 4px solid rgba(144, 147, 153, 0.8);
}

.walinet-inner.two {
    right: 0;
    top: 0;
    animation: rotate-two 1.6s ease-in-out infinite;
    border-right: 4px solid rgba(144, 147, 153, 0.6);
}

.walinet-inner.three {
    right: 0;
    bottom: 0;
    animation: rotate-three 1.6s ease-in-out infinite;
    border-top: 4px solid rgba(144, 147, 153, 0.4);
}

@keyframes rotate-one {
    0% { transform: rotateX(35deg) rotateY(-45deg) rotateZ(0); }
    100% { transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg); }
}

@keyframes rotate-two {
    0% { transform: rotateX(50deg) rotateY(10deg) rotateZ(0); }
    100% { transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg); }
}

@keyframes rotate-three {
    0% { transform: rotateX(35deg) rotateY(55deg) rotateZ(0); }
    100% { transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg); }
}

/* 添加新样式 */
.walinet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
}

.new-talk-btn {
    text-decoration: none;
    color: var(--color-meta, #666);
    transition: color 0.2s ease;
    display: flex;
    align-items: center;
    gap: 4px;
}

.new-talk-btn:hover {
    color: var(--color-theme-dark, #44D7B6);
}

.new-talk-btn i {
    font-size: 0.875rem;
}
</style>

{% raw %}
<link rel="stylesheet" href="/talks/talks.css">
<div id="talkContainer">
    <div class="comment-list" id="commentList">
        <div class="walinet-loading">
            <div class="walinet-part">
                <div style="display: flex; justify-content: center">
                    <div class="walinet-loader">
                        <div class="walinet-inner one"></div>
                        <div class="walinet-inner two"></div>
                        <div class="walinet-inner three"></div>
                    </div>
                </div>
            </div>
            <p style="text-align: center; display: block">说说加载中...</p>
        </div>
    </div>
</div>
<script src="/talks/talks.js"></script>
{% endraw %}
