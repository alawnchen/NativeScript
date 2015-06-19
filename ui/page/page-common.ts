﻿import contentView = require("ui/content-view");
import view = require("ui/core/view");
import dts = require("ui/page");
import frame = require("ui/frame");
import styleScope = require("ui/styling/style-scope");
import fs = require("file-system");
import fileSystemAccess = require("file-system/file-system-access");
import frameCommon = require("ui/frame/frame-common");
import actionBar = require("ui/action-bar");

export class Page extends contentView.ContentView implements dts.Page {
    public static navigatingToEvent = "navigatingTo";
    public static navigatedToEvent = "navigatedTo";
    public static navigatingFromEvent = "navigatingFrom";
    public static navigatedFromEvent = "navigatedFrom";
    public static shownModallyEvent = "shownModally";

    private _navigationContext: any;

    private _cssApplied: boolean;
    private _styleScope: styleScope.StyleScope = new styleScope.StyleScope();
    private _actionBar: actionBar.ActionBar;

    constructor(options?: dts.Options) {
        super(options);
        this.actionBar = new actionBar.ActionBar();
    }

    public onLoaded() {
        this._applyCss();
        super.onLoaded();
    }

    get navigationContext(): any {
        return this._navigationContext;
    }

    get css(): string {
        if (this._styleScope) {
            return this._styleScope.css;
        }
        return undefined;
    }
    set css(value: string) {
        this._styleScope.css = value;
        this._refreshCss();
    }

    get actionBar(): actionBar.ActionBar {
        return this._actionBar;
    }
    set actionBar(value: actionBar.ActionBar) {
        if (!value) {
            throw new Error("ActionBar cannot be null or undefined.");
        }

        if (this._actionBar !== value) {
            if (this._actionBar) {
                this._actionBar.page = undefined;
            }
            this._actionBar = value;
            this._actionBar.page = this;
        }
    }

    private _refreshCss(): void {
        if (this._cssApplied) {
            this._resetCssValues();
        }

        this._cssApplied = false;
        if (this.isLoaded) {
            this._applyCss();
        }
    }

    public addCss(cssString: string): void {
        this._addCssInternal(cssString, undefined);
    }

    private _addCssInternal(cssString: string, cssFileName: string): void {
        this._styleScope.addCss(cssString, cssFileName);
        this._refreshCss();
    }

    public addCssFile(cssFileName: string) {
        if (cssFileName.indexOf(fs.knownFolders.currentApp().path) !== 0) {
            cssFileName = fs.path.join(fs.knownFolders.currentApp().path, cssFileName);
        }

        var cssString;
        if (fs.File.exists(cssFileName)) {
            new fileSystemAccess.FileSystemAccess().readText(cssFileName, r => { cssString = r; });
            this._addCssInternal(cssString, cssFileName);
        }
    }

    get frame(): frame.Frame {
        return <frame.Frame>this.parent;
    }

    public onNavigatingTo(context: any) {
        this._navigationContext = context;

        this.notify({
            eventName: Page.navigatingToEvent,
            object: this,
            context: this.navigationContext
        });
    }

    public onNavigatedTo() {
        this.notify({
            eventName: Page.navigatedToEvent,
            object: this,
            context: this.navigationContext
        });
    }

    public onNavigatingFrom() {
        this.notify({
            eventName: Page.navigatingFromEvent,
            object: this,
            context: this.navigationContext
        });
    }

    public onNavigatedFrom(isBackNavigation: boolean) {
        this.notify({
            eventName: Page.navigatedFromEvent,
            object: this,
            context: this.navigationContext
        });

        this._navigationContext = undefined;
    }

    public showModal(moduleName: string, context: any, closeCallback: Function, fullscreen?: boolean) {
        var page = frameCommon.resolvePageFromEntry({ moduleName: moduleName });
        (<Page>page)._showNativeModalView(this, context, closeCallback, fullscreen);
    }

    public _addChildFromBuilder(name: string, value: any) {
        if (value instanceof actionBar.ActionBar) {
            this.actionBar = value;
        }
        else {
            super._addChildFromBuilder(name, value);
        }
    }

    protected _showNativeModalView(parent: Page, context: any, closeCallback: Function, fullscreen?: boolean) {
        //
    }

    protected _hideNativeModalView(parent: Page) {
        //
    }

    protected _raiseShownModallyEvent(parent: Page, context: any, closeCallback: Function) {
        var that = this;
        var closeProxy = function () {
            that._hideNativeModalView(parent);
            closeCallback.apply(undefined, arguments);
        };

        this.notify({
            eventName: Page.shownModallyEvent,
            object: this,
            context: context,
            closeCallback: closeProxy
        });
    }

    public _getStyleScope(): styleScope.StyleScope {
        return this._styleScope;
    }

    private _applyCss() {
        if (this._cssApplied) {
            return;
        }

        this._styleScope.ensureSelectors();

        var scope = this._styleScope;
        var checkSelectors = (view: view.View): boolean => {
            scope.applySelectors(view);
            return true;
        }

        checkSelectors(this);
        view.eachDescendant(this, checkSelectors);

        this._cssApplied = true;
    }

    private _resetCssValues() {
        var resetCssValuesFunc = (view: view.View): boolean => {
            view.style._resetCssValues();
            return true;
        }

        resetCssValuesFunc(this);
        view.eachDescendant(this, resetCssValuesFunc);

    }
}