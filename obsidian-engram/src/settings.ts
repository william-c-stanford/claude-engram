import { App, PluginSettingTab, Setting } from "obsidian";
import type EngramPlugin from "./main";

export interface EngramSettings {
  /** Vault-relative folder holding the zettel tree. */
  zettelRoot: string;
  /** Cards due within this window show as yellow. */
  warnWindowHours: number;
  /** Interval multiplier applied on a successful (Good) review. */
  easeFactor: number;
  /** Hide *.cards.md rows in the file explorer. */
  hideSidecars: boolean;
  /** Green chip opens a practice-ahead session; when off the chip is inert. */
  practiceAhead: boolean;
  /** Skip the reorientation sample from all-green parents in folder sessions. */
  skipGreenParents: boolean;
  /** How many cards an all-green parent contributes as a reorientation sample. */
  reorientationSampleSize: number;
}

export const DEFAULT_SETTINGS: EngramSettings = {
  zettelRoot: "wiki/zettel",
  warnWindowHours: 24,
  easeFactor: 2.5,
  hideSidecars: true,
  practiceAhead: true,
  skipGreenParents: false,
  reorientationSampleSize: 3,
};

export class EngramSettingTab extends PluginSettingTab {
  plugin: EngramPlugin;

  constructor(app: App, plugin: EngramPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Zettel root")
      .setDesc("Vault-relative folder holding the nested zettel tree.")
      .addText((t) =>
        t
          .setPlaceholder("wiki/zettel")
          .setValue(this.plugin.settings.zettelRoot)
          .onChange(async (v) => {
            this.plugin.settings.zettelRoot = v.replace(/^\/+|\/+$/g, "");
            await this.plugin.saveSettings();
            this.plugin.requestFullRescan();
          })
      );

    new Setting(containerEl)
      .setName("Warn window (hours)")
      .setDesc("Cards due within this window show as yellow.")
      .addText((t) =>
        t.setValue(String(this.plugin.settings.warnWindowHours)).onChange(async (v) => {
          const n = Number(v);
          if (Number.isFinite(n) && n > 0) {
            this.plugin.settings.warnWindowHours = n;
            await this.plugin.saveSettings();
            this.plugin.refreshBadges();
          }
        })
      );

    new Setting(containerEl)
      .setName("Ease factor")
      .setDesc("Interval multiplier on a successful review (default 2.5). Applies to future reviews only.")
      .addText((t) =>
        t.setValue(String(this.plugin.settings.easeFactor)).onChange(async (v) => {
          const n = Number(v);
          if (Number.isFinite(n) && n >= 1.3) {
            this.plugin.settings.easeFactor = n;
            await this.plugin.saveSettings();
          }
        })
      );

    new Setting(containerEl)
      .setName("Hide card sidecars")
      .setDesc("Hide *.cards.md files in the file explorer.")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.hideSidecars).onChange(async (v) => {
          this.plugin.settings.hideSidecars = v;
          await this.plugin.saveSettings();
          this.plugin.refreshBadges();
        })
      );

    new Setting(containerEl)
      .setName("Practice ahead")
      .setDesc("Clicking a green chip starts a practice-ahead session. When off, green chips are inert.")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.practiceAhead).onChange(async (v) => {
          this.plugin.settings.practiceAhead = v;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Skip green parents")
      .setDesc("Folder sessions normally open with a few cards from all-green parent notes to reorient before descending. Turn on to skip them.")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.skipGreenParents).onChange(async (v) => {
          this.plugin.settings.skipGreenParents = v;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Reorientation sample size")
      .setDesc("How many cards an all-green parent contributes before its children are reviewed.")
      .addText((t) =>
        t.setValue(String(this.plugin.settings.reorientationSampleSize)).onChange(async (v) => {
          const n = Number(v);
          if (Number.isInteger(n) && n >= 0) {
            this.plugin.settings.reorientationSampleSize = n;
            await this.plugin.saveSettings();
          }
        })
      );
  }
}
