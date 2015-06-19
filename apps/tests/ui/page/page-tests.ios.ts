﻿import PageTestCommon = require("./page-tests-common");
import PageModule = require("ui/page");
import TKUnit = require("../../TKUnit");
import LabelModule = require("ui/label");
import helper = require("../helper");
import view = require("ui/core/view");
import actionBar = require("ui/action-bar");

declare var exports;
require("utils/module-merge").merge(PageTestCommon, exports);

export function test_NavigateToNewPage_InnerControl() {
    var testPage: PageModule.Page;
    var pageFactory = function (): PageModule.Page {
        testPage = new PageModule.Page();
        PageTestCommon.addLabelToPage(testPage);
        return testPage;
    };

    helper.navigate(pageFactory);
    helper.goBack();
    
    var label = <LabelModule.Label>testPage.content;

    TKUnit.assert(label._context === undefined, "InnerControl._context should be undefined after navigate back.");
    TKUnit.assert(label.android === undefined, "InnerControl.android should be undefined after navigate back.");
    TKUnit.assert(label.isLoaded === false, "InnerControl.isLoaded should become false after navigating back");
}

export function test_NavBar_isVisible_when_MenuItems_areSet() {

    var page: PageModule.Page;
    var label: LabelModule.Label;
    var navBarIsVisible = false;

    var handler = function (data) {
        page.off(PageModule.Page.navigatedToEvent, handler);
        navBarIsVisible = (<any>page.frame.ios).showNavigationBar;
    }

    var pageFactory = function (): PageModule.Page {
        page = new PageModule.Page();
        page.on(PageModule.Page.navigatedToEvent, handler);

        var mi = new actionBar.ActionItem();
        mi.text = "B";
        page.actionBar.actionItems.addItem(mi);
        label = new LabelModule.Label();
        label.text = "Text";
        page.content = label;
        return page;
    };

    helper.navigate(pageFactory);

    try {
        TKUnit.assert(navBarIsVisible, "Expected: true, Actual: " + navBarIsVisible);
    }
    finally {
        page.off(view.View.loadedEvent, handler);
        helper.goBack();
    }
}

export function test_NavBarItemsAreClearedFromNativeWhenClearedFromNativeScript() {
    var page: PageModule.Page;
    var label: LabelModule.Label;

    var handler = function (data) {
        page.off(PageModule.Page.navigatedToEvent, handler);
        var menuItems = page.actionBar.actionItems.getItems();
        var i;
        for (i = menuItems.length - 1; i >= 0; i--) {
            page.actionBar.actionItems.removeItem(menuItems[i]);
        }
    }

    var pageFactory = function (): PageModule.Page {
        page = new PageModule.Page();
        page.on(PageModule.Page.navigatedToEvent, handler);

        var mi = new actionBar.ActionItem();
        mi.text = "B";
        page.actionBar.actionItems.addItem(mi);
        label = new LabelModule.Label();
        label.text = "Text";
        page.content = label;
        return page;
    };

    helper.navigate(pageFactory);

    try {
        var navigationItem: UINavigationItem = ((<UIViewController>page.ios).navigationItem);
        var rightBarButtonItemsCount = navigationItem.rightBarButtonItems ? navigationItem.rightBarButtonItems.count : 0;
        TKUnit.assertEqual(rightBarButtonItemsCount, 0, "After remove all items native items should be 0.");
    }
    finally {
        page.off(view.View.loadedEvent, handler);
        helper.goBack();
    }
}