// 从配置中获取设置
const config = window.TALKS_CONFIG || {};
const serverURL = config.serverURL || 'https://waline.fuling.me';
const path = config.path || '/talks/';
const pageSize = config.pageSize || 10;
const showControlPanel = config.showControlPanel ?? false;
const adminOnly = config.adminOnly ?? false; // 添加adminOnly配置

// 显示控制状态 - 使用配置的默认值
const displaySettings = {
    avatar: config.defaultSettings?.avatar ?? false,
    label: config.defaultSettings?.label ?? false,
    device: config.defaultSettings?.device ?? false,
    location: config.defaultSettings?.location ?? false
};

// 初始化容器HTML
function initializeContainer() {
    const container = document.getElementById('talkContainer');
    container.innerHTML = `
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
    `;
    if (showControlPanel) {
        container.innerHTML += `
            <div class="control-panel">
                <div class="toggle-group">
                    <button class="toggle-btn" data-feature="avatar">
                        <i class="fas fa-user-circle"></i> 头像
                    </button>
                    <button class="toggle-btn" data-feature="label">
                        <i class="fas fa-tags"></i> 标签
                    </button>
                    <button class="toggle-btn" data-feature="device">
                        <i class="fas fa-laptop"></i> 设备
                    </button>
                    <button class="toggle-btn" data-feature="location">
                        <i class="fas fa-map-marker-alt"></i> 地址
                    </button>
                </div>
            </div>
        `;
    }
}

// 格式化时间戳
function formatDateTime(timestamp) {
    if (!timestamp) return '未知时间';
    try {
        const date = new Date(Number(timestamp));
        if (isNaN(date.getTime())) return '未知时间';
        
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
        if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
        if (diff < 2592000000) return Math.floor(diff / 86400000) + '天前';
        
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch (e) {
        console.error('日期格式化错误:', e);
        return '未知时间';
    }
}

// 处理HTML内容和图片
function processContent(content) {
    const imgRegex = /<img([^>]+)src=["']([^"']+)["']([^>]*)>/g;
    const images = [];
    const textContent = content.replace(imgRegex, (match, before, src, after) => {
        images.push(src);
        return '';
    });

    let galleryHtml = '';
    if (images.length > 0) {
        galleryHtml = `
            <div class="gallery">
                ${images.map(src => `
                    <a href="${src}" target="_blank">
                        <img src="${src}" alt="图片">
                    </a>
                `).join('')}
            </div>
        `;
    }

    return textContent + galleryHtml;
}

// 记录已加载的评论和总数
let allComments = []; // 存储所有评论
let loadedComments = []; // 当前显示的评论
let totalComments = 0;

// 修改获取评论列表的函数
async function getComments(page = 1) {
    try {
        // 如果已经有数据，直接从缓存加载
        if (allComments.length > 0) {
            updateDisplayComments(page);
            return;
        }

        const response = await fetch(`${serverURL}/api/comment?path=${encodeURIComponent(path)}`);
        const result = await response.json();
        
        if (result && result.data) {
            let comments;
            
            if (Array.isArray(result.data)) {
                comments = result.data;
            } else if (Array.isArray(result.data.data)) {
                comments = result.data.data;
            } else {
                comments = [];
            }

            // 如果是仅限管理员模式，过滤评论
            if (adminOnly) {
                comments = comments.filter(comment => comment.type === 'administrator');
            }

            // 直接使用 API 返回的顺序
            allComments = comments;
            totalComments = comments.length;
            
            // 更新显示
            updateDisplayComments(page);
        } else {
            document.getElementById('commentList').innerHTML = '<p>暂无评论</p>';
        }
    } catch (error) {
        console.error('加载评论失败:', error);
        document.getElementById('commentList').innerHTML = '<p>加载评论失败</p>';
    }
}

// 新增：更新显示评论的函数
function updateDisplayComments(page) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    loadedComments = allComments.slice(0, end); // 加载到当前页的所有评论
    displayComments(loadedComments, totalComments, page);
}

// 点赞/取消点赞
async function likeComment(commentId, isLiked) {
    try {
        // 显示操作中提示
        VolantisApp.message(
            isLiked ? '取消点赞?' : '点赞中', 
            isLiked ? '(╬ Ò﹏Ó)' : '让点赞飞一会~',
            {
                icon: isLiked ? 'fas fa-heart-broken' : 'fa-solid fa-champagne-glasses',
                position: 'topRight',
                backgroundColor: isLiked ? '#ffcccc' : '#ccffcc',
                titleColor: isLiked ? '#ff4444' : '#44aa44',
                messageColor: isLiked ? '#990000' : '#006600'
            }
        );

        const response = await fetch(`${serverURL}/api/comment/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ like: !isLiked })
        });
        const data = await response.json();
        
        if (data.errno === 0) {
            // 更新本地评论数据
            const updatedComments = loadedComments.map(comment => {
                if (comment.objectId === commentId) {
                    const currentLikes = comment.like || 0;
                    return {
                        ...comment,
                        like: isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1
                    };
                }
                return comment;
            });
            
            // 更新本地数据并重新渲染
            loadedComments = updatedComments;
            const currentPage = Math.ceil(loadedComments.length / pageSize);
            displayComments(loadedComments, totalComments, currentPage);

            // 显示成功提示
            VolantisApp.message(
                isLiked ? '取消点赞成功' : '点赞成功', 
                isLiked ? '下次再来点赞吧~' : '感谢您的支持！',
                {
                    icon: isLiked ? 'fas fa-heart-broken' : 'fas fa-heart',
                    position: 'topRight',
                    backgroundColor: isLiked ? '#ffcccc' : '#ccffcc',
                    titleColor: isLiked ? '#ff4444' : '#44aa44',
                    messageColor: isLiked ? '#990000' : '#006600'
                }
            );
        } else {
            // 操作失败提示
            VolantisApp.message('操作失败', data.errmsg || '出错了！', {
                icon: 'fas fa-times-circle',
                position: 'topRight',
                backgroundColor: '#ffcccc',
                titleColor: '#ff4444',
                messageColor: '#990000'
            });
        }
    } catch (error) {
        console.error('操作失败:', error);
        // 网络错误提示
        VolantisApp.message('网络错误', '请稍后重试！', {
            icon: 'fas fa-times-circle',
            position: 'topRight',
            backgroundColor: '#ffcccc',
            titleColor: '#ff4444',
            messageColor: '#990000'
        });
    }
}

// 初始化开关事件监听
function initializeToggles() {
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        const feature = btn.dataset.feature;
        // 根据初始状态设置按钮样式
        if (displaySettings[feature]) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', () => {
            displaySettings[feature] = !displaySettings[feature];
            btn.classList.toggle('active');
            // 使用当前已加载的评论重新渲染，而不是重新获取
            if (loadedComments.length > 0) {
                const currentPage = Math.ceil(loadedComments.length / pageSize);
                displayComments(loadedComments, totalComments, currentPage);
            }
        });
    });
}

// 修改显示评论的函数
function displayComments(comments, total, currentPage) {
    const container = document.getElementById('commentList');
    const controlPanel = document.querySelector('.control-panel');
    
    // 如果是仅限管理员模式，过滤评论
    if (adminOnly) {
        comments = comments.filter(comment => comment.type === 'administrator');
        total = comments.length; // 更新总数为管理员评论数
    }

    // 修改头部显示，合并计数信息
    let html = `
        <div class="walinet-header">
            <div class="walinet-comment-count">
                ${comments.length > 0 ? `已加载『 ${loadedComments.length}/${totalComments} 』条` : '暂无说说'}
            </div>
            <a href="/talks/new/" class="new-talk-btn">
                <i class="fas fa-edit"></i>
                编辑
            </a>
        </div>
    `;
    
    if (!Array.isArray(comments) || comments.length === 0) {
        container.innerHTML = html;
        controlPanel?.classList.add('visible');
        return;
    }

    // 评论列表
    html += comments.map(comment => {
        const isLiked = comment.like > 0;
        const processedContent = processContent(comment.comment || '');
        
        return `
            <div class="comment-item">
                <div class="comment-top">
                    <div class="user-info">
                        ${displaySettings.avatar ? `
                            <img class="avatar" src="${comment.avatar}" alt="avatar">
                        ` : ''}
                        <div class="user-meta">
                            <div class="user-name">
                                <strong>${comment.nick || '匿名'}</strong>
                                ${displaySettings.label ? `
                                    <div class="user-label-container">
                                        ${comment.type === 'administrator' ? '<span class="user-label admin">博主</span>' : ''}
                                        ${comment.label ? `<span class="user-label">${comment.label}</span>` : ''}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="time-location">
                        ${displaySettings.location && comment.addr ? `
                            <span class="comment-location">
                                <i class="fas fa-map-marker-alt"></i>
                                ${comment.addr}
                            </span>
                        ` : ''}
                        <span class="comment-time">${formatDateTime(comment.time)}</span>
                    </div>
                </div>
                <div class="comment-content">${processedContent}</div>
                <div class="comment-bottom">
                    ${displaySettings.device ? `
                        <div class="device-info-bottom">
                            <span class="device-info">
                                <i class="fas fa-desktop"></i> ${comment.os || '未知系统'}
                            </span>
                            <span class="device-info">
                                <i class="fas fa-globe"></i> ${comment.browser || '未知浏览器'}
                            </span>
                        </div>
                    ` : '<div></div>'}
                    <button class="like-btn ${isLiked ? 'active' : ''}" 
                            onclick="likeComment('${comment.objectId}', ${isLiked})">
                        <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
                        ${comment.like ? comment.like : 0}
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // 修改加载更多按钮，移除计数信息
    if (loadedComments.length < totalComments) {
        html += `
            <div class="load-more">
                <button onclick="getComments(${currentPage + 1})" class="load-more-btn">
                    加载更多
                </button>
            </div>
        `;
    }
    
    container.innerHTML = html;
    controlPanel?.classList.add('visible');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    if (typeof VolantisApp === 'undefined') {
        console.error('Volantis not loaded! Please make sure Volantis is properly installed.');
        return;
    }
    initializeContainer();
    initializeToggles();
    getComments(1);
});
