var controller = (function($) {
    
    var PAGE = 1,
        MAX_PAGE = 10,
        KEYWORD = 'javascript',
        SCROLL = false,
        SCROLLING;
    
    var layout = (function() {

        var RESIZING,
            leftMargin = 15,
            topMargin = 15,
            itemWidth = 320,
            vn = 0,
            id = 0,
            container = $('.container'),
            getMaxN = function() { return ~~(container.width() / (itemWidth + leftMargin)) },
            maxN = getMaxN(),
            items = [],
            colHeight = [];
            
        function init() {
            colHeight = [];
            for (var i = 0; i < maxN; i++) {
                colHeight.push(0);
            }
        }

        init();

        function getLeft(col) {
            return leftMargin + col * (leftMargin + itemWidth);
        }
        function getTop(col) {
            return topMargin + colHeight[col];
        }

        function rescale() {
            var checkMaxN = getMaxN();
            if (checkMaxN !== maxN) {
                maxN = checkMaxN;
                colHeight = [];
                vn = 0;
                init();

                for (var i = 0; i < items.length; i++) {
                    var node = items[i].node;
                    node.css('left', getLeft(vn));
                    node.css('top', getTop(vn));

                    pushColHeight(vn, node.outerHeight());

                    iter(false);
                }

            }

        }
        function iter(increaseId) {
            if (vn+1 >= maxN) {
                vn = 0;
            } else {
                vn++;
            }
            if (increaseId) {
                id++;
            }
        }

        function pushColHeight(col, nodeHeight) {
            colHeight[col] += nodeHeight + topMargin;
        }


        $(window).resize(function(e) {
            clearTimeout(RESIZING);
            RESIZING = setTimeout(function() {
                rescale();
            }, 100);
        });


        return {
            addItem: function(data) {
                var obj = Object.create(data);
                obj.id = id;


                container.append(renderItem(obj));

                newItem = {
                    id: id,
                    node: $('.container .item[data-id="'+id+'"]')
                };

                newItem.node.css('left', getLeft(vn)).css('top', getTop(vn));

                items.push(newItem);
                pushColHeight(vn, newItem.node.outerHeight());

                iter(true);
            },
            rescale: function() {
                rescale();
            },
            clear: function() {
                container.html('');
                vn = 0,
                id = 0;
                maxN = getMaxN();
                items = [];
                init();                
            }

        };
    })();

    
    function renderItem(obj) {
        var out = '<div class="item" data-id="' + obj.id + '">';
        out += '<div class="header">' + obj.tweet + '</div>';
        if (obj.text) {
            out += '<p>' + obj.text + '</p>';
        }
        out += '<div class="footer clearfix">';
        out += '<div class="left">';
        out += '<p><a href="http://twitter.com/'+ obj.user +'/">@'+ obj.user +'</a></p>';
        out += '<p>'+ obj.date +'</p>';
        out += '<p><a href="http://twitter.com/'+ obj.user +'/status/'+ obj.tweet_id +'">View on Twitter</a>';
        out += '</div>';
        out += '<div class="right"><div class="thumb" style="background-image: url('+ obj.thumb +')" /></div>';
        out += '</div>';
        out += '</div>';
        return out;
    }
    
    function loadData() {
        $.getJSON("http://search.twitter.com/search.json?q=" + encodeURIComponent(KEYWORD) + "&rpp=50&include_entities=true&result_type=mixed&page=" + PAGE + "&callback=?", function(data) {
            var dataset = data.results;
            for (var i = 0; i < dataset.length; i++) {
                layout.addItem({
                    tweet: dataset[i].text.replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, '<a href="$1">$1</a>').replace(/(?:\@([\w]{1,15}))/ig, '<a href="https://twitter.com/$1">@$1</a>'),
                    tweet_id: dataset[i].id_str,
                    user: dataset[i].from_user,
                    thumb: dataset[i].profile_image_url,
                    date: dataset[i].created_at.split(' ').splice(0, 4).join(' ')
                });
            }
        });
    }
    
    return {
        loadNext: function() {
            if (++PAGE <= MAX_PAGE) {
                loadData();
                return true;
            }
            return false;
        },
        start: function() {
            layout.clear();
            PAGE = 1;
            loadData();
        },
        setKeyword: function(keyword) {
            KEYWORD = keyword;
            this.start();
        },
        enableScrolling: function() {
            if (SCROLL) {
                return false;
            }
            var that = this;
            (function(doc, win) {
                doc.bind('scroll', function() {
                    clearTimeout(SCROLLING);
                       
                    SCROLLING = setTimeout(function() {
                        if ((doc.height() - win.height()) - doc.scrollTop() < 200) {
                            that.loadNext();
                        }
                    }, 100);
                
                    
                });
            })($(document), $(window));
            SCROLL = true;
        }
    };
    
})(jQuery);