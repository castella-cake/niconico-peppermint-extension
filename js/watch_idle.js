getStorageData.then(createCSSRule, onError);
function createCSSRule(result) {
    if ( result.quickvidarticle == true ) {
        $(function() {
            let diclink = "https://dic.nicovideo.jp/v/" + location.pathname.slice(7)
            $('.VideoTitle').append('<a href="' + diclink + '" style="width:16px;height:16px;display:inline-block;margin-left:5px;position:relative;top:5px;" class="Link NicoDicLink" target="_blank" rel="noopener noreferrer"><span class="NicoDicIcon is-available"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" fill="#fff" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.4"><path d="M4 12a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4h92a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4H62L50 24h38a4 4 0 0 1 4 4v68a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V28a4 4 0 0 1 4-4h18l12-12H4Zm26 52a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h40a2 2 0 0 0 2-2V66a2 2 0 0 0-2-2H30Zm0-28a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h40a2 2 0 0 0 2-2V38a2 2 0 0 0-2-2H30Z"></path></svg></span></a>')
        })
    }
    if ( result.usenicoboxui == true || result.usetheaterui == true ) {
        $(function() {
            function ContainerResize(e) {
                console.log('VideoSymbolContainer resized!')
                $('.CommentRenderer').css({
                    'width': $(e).width() + "px",
                    'height': $(e).height() + "px",
                })
                $('.VideoSymbolContainer').css({
                    'width': $(e).width() + "px",
                    'height': $(e).height() + "px",
                })
            }
            if ( document.querySelector('.MainVideoPlayer video') != null ) {
            // theater and Nicobox UI
                ContainerResize(document.querySelector('.MainVideoPlayer video'))
                document.querySelector('.MainVideoPlayer video').addEventListener('canplay propertychange', ContainerResize)
            }
        })
    }
    if (result.usenicoboxui != true && result.usetheaterui != true ) {
        $(function() {
            if (result.playertheme == "harazyuku") {
                function updateOffset() {
                    //alert('Offset Changed!')
                    let lastareawidth = $(".ControllerContainer-area:last-child").width()
                    console.log( $(".ControllerContainer-area:last-child").width() )
                    let rightoffset = lastareawidth - 172
                    console.log( rightoffset )
                    if ( rightoffset > 0 ) {
                        volwidth = 80 - rightoffset
                        rightoffset += 165
                        rightoffset = rightoffset + 'px'
                        console.log( rightoffset )
                        $('.VolumeBarContainer').css({
                            'right': rightoffset,
                            'width': volwidth
                        })
                    } 
                }
                updateOffset()
                const ctrllastchild = document.querySelector('.ControllerContainer-area:last-child')
                const observer = new MutationObserver(records => {
                    updateOffset()    
                })
                observer.observe(ctrllastchild, {
                    childList: true
                })
            }
            if (result.playertheme == "rc1") {
                function updateOffset() {
                    //alert('Offset Changed!')
                    let lastareawidth = $(".ControllerContainer-area:last-child").width()
                    console.log( $(".ControllerContainer-area:last-child").width() )
                    let rightoffset = lastareawidth - 192
                    console.log( rightoffset )
                    if ( rightoffset > 0 ) {
                        volwidth = 80 - rightoffset
                        rightoffset += 185
                        rightoffset = rightoffset + 'px'
                        console.log( rightoffset )
                        $('.VolumeBarContainer').css({
                            'right': rightoffset,
                            'width': volwidth
                        })
                    } 
                }
                updateOffset()
                const ctrllastchild = document.querySelector('.ControllerContainer-area:last-child')
                const observer = new MutationObserver(records => {
                    updateOffset()    
                })
                observer.observe(ctrllastchild, {
                    childList: true
                })
            }
            if (result.playertheme == "mint") {
                /* 後回し
                function updateOffset() {
                    //alert('Offset Changed!')
                    let lastareawidth = $(".ControllerContainer-area:last-child").width()
                    console.log( $(".ControllerContainer-area:last-child").width() )
                    let rightoffset = lastareawidth - 172
                    console.log( rightoffset )
                    if ( rightoffset > 0 ) {
                        volwidth = 80 - rightoffset
                        rightoffset += 165
                        rightoffset = rightoffset + 'px'
                        console.log( rightoffset )
                        $('.VolumeBarContainer').css({
                            'right': rightoffset,
                            'width': volwidth
                        })
                    } 
                }
                updateOffset()
                const ctrllastchild = document.querySelector('.ControllerContainer-area:last-child')
                const observer = new MutationObserver(records => {
                    updateOffset()    
                })
                observer.observe(ctrllastchild, {
                    childList: true
                })*/
            }
        })
    }
}