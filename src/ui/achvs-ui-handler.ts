import BattleScene, { Button } from "../battle-scene";
import { Achv, achvs } from "../system/achv";
import MessageUiHandler from "./message-ui-handler";
import { TextStyle, addTextObject } from "./text";
import { Mode } from "./ui";

export default class AchvsUiHandler extends MessageUiHandler {
  private achvsContainer: Phaser.GameObjects.Container;
  private achvIconsContainer: Phaser.GameObjects.Container;

  private achvIconsBg: Phaser.GameObjects.NineSlice;
  private achvIcons: Phaser.GameObjects.Sprite[];
  private titleText: Phaser.GameObjects.Text;
  private scoreText: Phaser.GameObjects.Text;
  private unlockText: Phaser.GameObjects.Text;

  private cursorObj: Phaser.GameObjects.NineSlice;

  constructor(scene: BattleScene, mode?: Mode) {
    super(scene, mode);
  }

  setup() {
    const ui = this.getUi();
    
    this.achvsContainer = this.scene.add.container(1, -(this.scene.game.canvas.height / 6) + 1);

    this.achvsContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.scene.game.canvas.width / 6, this.scene.game.canvas.height / 6), Phaser.Geom.Rectangle.Contains);

    const headerBg = this.scene.add.nineslice(0, 0, 'window', null, (this.scene.game.canvas.width / 6) - 2, 24, 6, 6, 6, 6);
    headerBg.setOrigin(0, 0);

    const headerText = addTextObject(this.scene, 0, 0, 'Achievements', TextStyle.SETTINGS_LABEL);
    headerText.setOrigin(0, 0);
    headerText.setPositionRelative(headerBg, 8, 4);

    this.achvIconsBg = this.scene.add.nineslice(0, headerBg.height, 'window', null, (this.scene.game.canvas.width / 6) - 2, (this.scene.game.canvas.height / 6) - headerBg.height - 68, 6, 6, 6, 6);
    this.achvIconsBg.setOrigin(0, 0);

    this.achvIconsContainer = this.scene.add.container(6, headerBg.height + 6);
    
    this.achvIcons = [];

    for (let a = 0; a < Object.keys(achvs).length; a++) {
      const x = (a % 17) * 18;
      const y = Math.floor(a / 17) * 18;

      const icon = this.scene.add.sprite(x, y, 'items', 'unknown');
      icon.setOrigin(0, 0);
      icon.setScale(0.5);

      this.achvIcons.push(icon);
      this.achvIconsContainer.add(icon);
    }

    const titleBg = this.scene.add.nineslice(0, headerBg.height + this.achvIconsBg.height, 'window', null, 174, 24, 6, 6, 6, 6);
    titleBg.setOrigin(0, 0);

    this.titleText = addTextObject(this.scene, 0, 0, '', TextStyle.WINDOW);
    this.titleText.setOrigin(0, 0);
    this.titleText.setPositionRelative(titleBg, 8, 4);

    const scoreBg = this.scene.add.nineslice(titleBg.x + titleBg.width, titleBg.y, 'window', null, 46, 24, 6, 6, 6, 6);
    scoreBg.setOrigin(0, 0);

    this.scoreText = addTextObject(this.scene, 0, 0, '', TextStyle.WINDOW);
    this.scoreText.setOrigin(0, 0);
    this.scoreText.setPositionRelative(scoreBg, 8, 4);

    const unlockBg = this.scene.add.nineslice(scoreBg.x + scoreBg.width, scoreBg.y, 'window', null, 98, 24, 6, 6, 6, 6);
    unlockBg.setOrigin(0, 0);

    this.unlockText = addTextObject(this.scene, 0, 0, '', TextStyle.WINDOW);
    this.unlockText.setOrigin(0, 0);
    this.unlockText.setPositionRelative(unlockBg, 8, 4);

    const descriptionBg = this.scene.add.nineslice(0, titleBg.y + titleBg.height, 'window', null, (this.scene.game.canvas.width / 6) - 2, 42, 6, 6, 6, 6);
    descriptionBg.setOrigin(0, 0);

    const descriptionText = addTextObject(this.scene, 0, 0, '', TextStyle.WINDOW, { maxLines: 2 });
    descriptionText.setWordWrapWidth(1870);
    descriptionText.setOrigin(0, 0);
    descriptionText.setPositionRelative(descriptionBg, 8, 4);

    this.message = descriptionText;

    this.achvsContainer.add(headerBg);
    this.achvsContainer.add(headerText);
    this.achvsContainer.add(this.achvIconsBg);
    this.achvsContainer.add(this.achvIconsContainer);
    this.achvsContainer.add(titleBg);
    this.achvsContainer.add(this.titleText);
    this.achvsContainer.add(scoreBg);
    this.achvsContainer.add(this.scoreText);
    this.achvsContainer.add(unlockBg);
    this.achvsContainer.add(this.unlockText);
    this.achvsContainer.add(descriptionBg);
    this.achvsContainer.add(descriptionText);

    ui.add(this.achvsContainer);

    this.setCursor(0);

    this.achvsContainer.setVisible(false);
  }

  show(args: any[]) {
    super.show(args);

    const achvUnlocks = this.scene.gameData.achvUnlocks;

    Object.values(achvs).forEach((achv: Achv, i: integer) => {
      const icon = this.achvIcons[i];
      const unlocked = achvUnlocks.hasOwnProperty(achv.id);
      const hidden = achv.secret && (!achv.parentId || !achvUnlocks.hasOwnProperty(achv.parentId));
      const tinted = !hidden && !unlocked;

      icon.setFrame(!hidden ? achv.iconImage : 'unknown');
      if (tinted)
        icon.setTintFill(0);
      else
        icon.clearTint();
    });

    this.achvsContainer.setVisible(true);
    this.setCursor(0);

    this.getUi().moveTo(this.achvsContainer, this.getUi().length - 1);

    this.getUi().hideTooltip();
  }

  protected showAchv(achv: Achv) {
    const achvUnlocks = this.scene.gameData.achvUnlocks;
    const unlocked = achvUnlocks.hasOwnProperty(achv.id);
    const hidden = achv.secret && (!achv.parentId || !achvUnlocks.hasOwnProperty(achv.parentId));

    this.titleText.setText(unlocked ? achv.name : '???');
    this.showText(!hidden ? achv.description : '');
    this.scoreText.setText(`${achv.score}pt`);
    this.unlockText.setText(unlocked ? new Date(achvUnlocks[achv.id]).toLocaleDateString() : 'Locked');
  }

  processInput(button: Button): boolean {
    const ui = this.getUi();

    let success = false;

    if (button === Button.CANCEL) {
      success = true;
      this.scene.ui.revertMode();
    } else {
      switch (button) {
        case Button.UP:
          if (this.cursor >= 17)
            success = this.setCursor(this.cursor - 17);
          break;
        case Button.DOWN:
          if (this.cursor + 17 < Object.keys(achvs).length)
            success = this.setCursor(this.cursor + 17);
          break;
        case Button.LEFT:
          if (this.cursor % 17)
            success = this.setCursor(this.cursor - 1);
          break;
        case Button.RIGHT:
          if (this.cursor % 17 < 16 && this.cursor < Object.keys(achvs).length - 1)
            success = this.setCursor(this.cursor + 1);
          break;
      }
    }

    if (success)
      ui.playSelect();

    return success;
  }

  setCursor(cursor: integer): boolean {
    let ret = super.setCursor(cursor);

    let updateAchv = ret;

    if (!this.cursorObj) {
      this.cursorObj = this.scene.add.nineslice(0, 0, 'starter_select_cursor_highlight', null, 16, 16, 1, 1, 1, 1);
      this.cursorObj.setOrigin(0, 0);
      this.achvIconsContainer.add(this.cursorObj);
      updateAchv = true;
    }

    this.cursorObj.setPositionRelative(this.achvIcons[this.cursor], 0, 0);

    if (updateAchv)
      this.showAchv(achvs[Object.keys(achvs)[cursor]]);

    return ret;
  }

  clear() {
    super.clear();
    this.achvsContainer.setVisible(false);
    this.eraseCursor();
  }

  eraseCursor() {
    if (this.cursorObj)
      this.cursorObj.destroy();
    this.cursorObj = null;
  }
}