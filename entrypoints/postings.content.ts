export default defineContentScript({
    matches: ['https://www.nicovideo.jp/my*'],

    async main(ctx) {
        const { enableTimelineSeigaFilter } = await browser.storage.sync.get("enableTimelineSeigaFilter")
        const ui = createIntegratedUi(ctx, {
            position: 'inline',
            anchor: '.SubMenuLink.TimelineSideContainer-menuItem:has(.SubMenuLink-link[href="/my/timeline/live"])',
            tag: "li",
            append: "after",
            onMount: (container) => {
                // コンテナのクラスを元と同じように設定
                container.className = "SubMenuLink TimelineSideContainer-menuItem"

                // 元と同じように<li>内を構築する
                const app = document.createElement('a');
                app.className = "SubMenuLink-link SubMenuLink-link_internal PM-Timeline-CustomSubmenuLink"
                app.href = "javascript:void(0);"

                const span = document.createElement('span');
                span.className = "SubMenuLink-label"
                span.textContent = 'イラスト投稿';

                app.append(span);

                app.addEventListener('click', async () => {
                    if (app.classList.contains('SubMenuLink-link_active')) return
                    // 動画投稿とかにいたら何も出てこないので、コンテンツ投稿のリンクをクリック
                    const postingLink = document.querySelector('.SubMenuLink-link_internal[href="/my/timeline/postings"]');
                    if (!postingLink || !(postingLink instanceof HTMLAnchorElement)) return
                    postingLink.click();

                    // クラスを追加
                    const timelineContainer = document.getElementsByClassName("TimelinePage")
                    if (timelineContainer.length < 1) return
                    timelineContainer[0].classList.add('PM-Timeline-hideNicoSeiga')

                    // active を外してこっちに付与
                    const activeLink = document.getElementsByClassName("SubMenuLink-link_active")
                    if (activeLink.length) activeLink[0].classList.remove('SubMenuLink-link_active')
                    app.classList.add('SubMenuLink-link_active')

                    // 遅れて active が来た場合にも対応するためMutationObserverを使う
                    const observer = new MutationObserver(ms => {
                        if (!app.classList.contains('SubMenuLink-link_active')) return
                        ms.forEach(mutation => {
                            if (mutation.type === 'attributes' && mutation.attributeName === 'class' && mutation.target instanceof HTMLAnchorElement && mutation.target.classList.contains("SubMenuLink-link_active")) {
                                mutation.target.classList.remove('SubMenuLink-link_active')
                                observer.disconnect()
                            }
                        })

                    })
                    observer.observe(postingLink, { attributes: true })

                    // 他のリンクが押された場合にactiveを外す
                    const otherLinks = document.querySelectorAll('.SubMenuLink-link_internal:not(.PM-Timeline-CustomSubmenuLink)')
                    const onOtherLinkClick = (link: Event) => {
                        observer.disconnect()
                        app.classList.remove('SubMenuLink-link_active')
                        if (link.currentTarget instanceof HTMLAnchorElement) link.currentTarget.classList.add('SubMenuLink-link_active')
                        timelineContainer[0].classList.remove('PM-Timeline-hideNicoSeiga')
                        otherLinks.forEach(link => link.removeEventListener('click', onOtherLinkClick))
                    }
                    otherLinks.forEach(link => {
                        link.addEventListener('click', onOtherLinkClick)
                    })
                })

                container.append(app);
            },
        });

        // autoMountにすればアンカーが消滅したりしてもまた出てきた時に自動でマウントされる
        if (enableTimelineSeigaFilter) ui.autoMount();
    },
});