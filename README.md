# Track-with-tags
**Track-with-tags** is an autonomous library which helps you perform Google analytics tracking by adding html attributes on the tags you want to track.

# How to use it?
**Track-with-tags** allows you to pilot all the Google analytics trackings (page, event, page variable, user variable) directly in your html document. No need to include jQuery and write spaghetty code to trigger the tracking.

See `Installation` to include the classic **Google analytics** code and the **Track-with-tags** library in your html page. Then you can simply:
* track a click on any html element with `ga-click` (`event_value` is often empty, `non-interaction_mode` should be `1` or `true` to avoid impacting your goal rate):
```html
    <!-- variables used with ga-click-->
    <a ga-click="event(event_category,event_action,event_label,event_value,non-interaction_mode)" href="#tryForFreeContent">Free trial</a>

    <!-- an example to track a click event on a try-for-free inner link -->
    <a ga-click="event(landing page,try-for-free click,link click,,1)" href="#tryForFreeContent">Free trial</a>
```

* track focus on input fields with `ga-focus`:
```html
<form>
    <input name="login" type="email" placeholder="Email"
            ga-focus="event(landing page,focus-email,login form,,1)'}" />

    <input name="password" type="password" placeholder="Choose a password"
            ga-focus="event(landing page,focus-password,login form,,1)'}" />

    <button type="submit">Login</button>
</form>
```
* track form submission `ga-submit`:
```html
<form>
    <input name="login" type="email" placeholder="Email" />

    <input name="password" type="password" placeholder="Choose a password" />

    <button type="submit" ga-click="event(landing page,login submit,login form,,1)"}>Login</button>
</form>
```

# Installation
You must have [Google analytics](https://developers.google.com/analytics/devguides/collection/analyticsjs/) already setup the classic way in your page:
```html
<body>
    ...
    <!-- Google Analytics -->
    <script>
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-XXXXX-Y', 'auto');
    ga('send', 'pageview');
    </script>
    <!-- End Google Analytics -->
</body>
```

**Track-with-tags** relies on [AngularJS](https://angularjs.org/), which you may already have included in your html page:
* if you already use AngularJS, download `libs/track-with-tags_raw-min.js` and include it at the end of the html body:
```html
<body>
    ...
    <!-- your inclusion of AngularJS -->
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.5.0/angular.min.js"></script>
    <!-- include your copy of Track-with-tags AFTER AngularJS inclusion -->
    <script src="/track-with-tags_raw-min.js"></script>
</body>
```
* if you don't use AngularJS, download and use `libs/track-with-tags_bundled-min.js`
```html
<body>
    ...
    <!-- include your copy of Track-with-tags bundled with AngularJS-->
    <script src="/track-with-tags_bundled-min.js"></script>
</body>
```

The other two packages (without `min`) are developer versions which includes comments in the source code and are thus heavier to download.
