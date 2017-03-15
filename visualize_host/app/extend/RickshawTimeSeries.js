Rickshaw.namespace('Rickshaw.Series.RealTimeSeries');

Rickshaw.Series.RealTimeSeries = Rickshaw.Class.create(Rickshaw.Series, {
    /**
     * data [{name:[[x,y]]}]
     *      
     */
    initialize: function (data, palette, options) {

        options = options || {};

        if (typeof (options.timeDuration) === 'undefined') {
            throw new Error('RealTime series requires timeDuration');
        }

        this.palette = new Rickshaw.Color.Palette(palette);

        if (data && (typeof (data) == "object") && Array.isArray(data)) {
            data.forEach(function (item) { this.addItem(item) }, this);
        }
    },

    addData: function ($super, data) {
        // super
        var index = this.getIndex();

        Rickshaw.keys(data).forEach(function (name) {
            if (!this.itemByName(name)) {
                this.addItem({ name: name });
            }
        }, this);

        // var count = 0;
        this.forEach(function (item) {
            var dataItem = data[item.name] || [];
            var latest = item.data[item.data.length - 1];
            dataItem.forEach(function (el) {
                // if (!latest || el.x > latest.x) {
                // count++;
                item.data.push({ x: el.x, y: el.y })
                // }
            });
        });

        // console.log("add "+count);

        this.currentSize += 1;
        this.currentIndex += 1;

        if (this.maxDataPoints !== undefined) {
            while (this.currentSize > this.maxDataPoints) {
                this.dropData();
            }
        }
    },
});

Rickshaw.Series.RealTimeSeries.create = function (data, palette, maxDataPoints) {
    return new Rickshaw.Series.RealTimeSeries(data, palette, {
        timeInterval: 3000,
        maxDataPoints: maxDataPoints,
        timeBase: new Date().getTime() / 1000
    })
};
