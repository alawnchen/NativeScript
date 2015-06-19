﻿import dts = require("ui/action-bar");
import pages = require("ui/page");
import bindable = require("ui/core/bindable");
import dependencyObservable = require("ui/core/dependency-observable");
import enums = require("ui/enums");
import proxy = require("ui/core/proxy");

var ACTION_ITEMS = "actionItems";

export module knownCollections {
    export var actionItems = "actionItems";
}

function onTitlePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var actionBar = <ActionBar>data.object;
    actionBar._onTitlePropertyChanged();
}

function onIconPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var actionBar = <ActionBar>data.object;
    actionBar._onIconPropertyChanged();
}

export class ActionBar extends bindable.Bindable implements dts.ActionBar {
    public static titleProperty = new dependencyObservable.Property("title", "ActionBar", new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.None, onTitlePropertyChanged));
    public static iconProperty = new dependencyObservable.Property("icon", "ActionBar", new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.None, onIconPropertyChanged));
    public static androidIconVisibilityProperty = new dependencyObservable.Property("androidIconVisibility", "ActionBar", new proxy.PropertyMetadata("auto", dependencyObservable.PropertyMetadataSettings.None, onIconPropertyChanged));

    private _actionItems: ActionItems;
    private _navigationButton: NavigationButton;
    private _page: pages.Page;

    get title(): string {
        return this._getValue(ActionBar.titleProperty);
    }
    set title(value: string) {
        this._setValue(ActionBar.titleProperty, value);
    }

    get icon(): string {
        return this._getValue(ActionBar.iconProperty);
    }
    set icon(value: string) {
        this._setValue(ActionBar.iconProperty, value);
    }

    get androidIconVisibility(): string {
        return this._getValue(ActionBar.androidIconVisibilityProperty);
    }
    set androidIconVisibility(value: string) {
        this._setValue(ActionBar.androidIconVisibilityProperty, value);
    }

    get navigationButton(): NavigationButton {
        return this._navigationButton;
    }
    set navigationButton(value: NavigationButton) {
        if (this._navigationButton !== value) {
            if (this._navigationButton) {
                detachActionItem(this._navigationButton);
            }

            this._navigationButton = value;

            if (this._navigationButton) {
                attachActionItem(this._navigationButton, this);
            }

            this.updateActionBar();
        }
    }

    get actionItems(): ActionItems {
        return this._actionItems;
    }
    set actionItems(value: ActionItems) {
        throw new Error("actionItems property is read-only");
    }

    get page(): pages.Page {
        return this._page;
    }
    set page(value: pages.Page) {
        this._page = value;

        this.unbind("bindingContext");
        this.bind({
            sourceProperty: "bindingContext",
            targetProperty: "bindingContext"
        }, this._page);
    }

    constructor() {
        super();
        this._actionItems = new ActionItems(this);
    }

    public static onTitleChanged

    public updateActionBar() {
        // 
    }

    public _onTitlePropertyChanged() {
        //
    }

    public _onIconPropertyChanged() {
        //
    }

    public _updateAndroidActionBar(menu: android.view.IMenu) {
        //
    }

    public _onAndroidItemSelected(itemId: number): boolean {
        return false;
    }

    public _addArrayFromBuilder(name: string, value: Array<any>) {
        if (name === ACTION_ITEMS) {
            this.actionItems.setItems(value);
        }
    }

    public _addChildFromBuilder(name: string, value: any) {

        if (value instanceof NavigationButton) {
            this.navigationButton = value;
        }
    }

    public shouldShow(): boolean {
        if (this.title ||
            this.icon ||
            this.navigationButton ||
            this.actionItems.getItems().length > 0) {

            return true;
        }

        return false;
    }
}

export class ActionItems implements dts.ActionItems {
    private _items: Array<ActionItem> = new Array<ActionItem>();
    private _actionBar: ActionBar;

    constructor(actionBar: ActionBar) {
        this._actionBar = actionBar;
    }

    public addItem(item: ActionItem): void {
        if (!item) {
            throw new Error("Cannot add empty item");
        }

        this._items.push(item);

        attachActionItem(item, this._actionBar);

        this.invalidate();
    }

    public removeItem(item: ActionItem): void {
        if (!item) {
            throw new Error("Cannot remove empty item");
        }

        var itemIndex = this._items.indexOf(item);
        if (itemIndex < 0) {
            throw new Error("Cannot find item to remove");
        }

        detachActionItem(item);

        this._items.splice(itemIndex, 1);
        this.invalidate();
    }

    public getItems(): Array<ActionItem> {
        return this._items.slice();
    }

    public getItemAt(index: number): ActionItem {
        if (index < 0 || index >= this._items.length) {
            return undefined;
        }

        return this._items[index];
    }

    public setItems(items: Array<ActionItem>) {
        // Remove all existing items
        while (this._items.length > 0) {
            this.removeItem(this._items[this._items.length - 1]);
        }

        // Add new items
        for (var i = 0; i < items.length; i++) {
            this.addItem(items[i]);
        }

        this.invalidate();
    }

    private invalidate() {
        if (this._actionBar) {
            this._actionBar.updateActionBar();
        }
    }
}

export class ActionItemBase extends bindable.Bindable implements dts.ActionItemBase {
    public static tapEvent = "tap";

    public static textProperty = new dependencyObservable.Property(
        "text", "ActionItemBase", new dependencyObservable.PropertyMetadata("", null, ActionItemBase.onItemChanged));

    public static iconProperty = new dependencyObservable.Property(
        "icon", "ActionItemBase", new dependencyObservable.PropertyMetadata(null, null, ActionItemBase.onItemChanged));

    private static onItemChanged(data: dependencyObservable.PropertyChangeData) {
        var menuItem = <ActionItem>data.object;
        if (menuItem.actionBar) {
            menuItem.actionBar.updateActionBar();
        }
    }

    get text(): string {
        return this._getValue(ActionItemBase.textProperty);
    }
    set text(value: string) {
        this._setValue(ActionItemBase.textProperty, value);
    }

    get icon(): string {
        return this._getValue(ActionItemBase.iconProperty);
    }
    set icon(value: string) {
        this._setValue(ActionItemBase.iconProperty, value);
    }

    public _raiseTap() {
        this._emit(ActionItem.tapEvent);
    }

    actionBar: ActionBar;
}

export class ActionItem extends ActionItemBase {
    private _androidPosition: string = enums.AndroidActionItemPosition.actionBar;
    private _iosPosition: string = enums.IOSActionItemPosition.right;

    get androidPosition(): string {
        return this._androidPosition;
    }
    set androidPosition(value: string) {
        this._androidPosition = value;
    }

    get iosPosition(): string {
        return this._iosPosition;
    }
    set iosPosition(value: string) {
        this._iosPosition = value;
    }
}

export class NavigationButton extends ActionItemBase {

}

function attachActionItem(item: ActionItemBase, bar: ActionBar) {
    item.actionBar = this._actionBar;
    item.bind({
        sourceProperty: "bindingContext",
        targetProperty: "bindingContext"
    }, this._actionBar);
}

function detachActionItem(item: ActionItemBase) {
    item.actionBar = undefined;
    item.unbind("bindingContext");
}