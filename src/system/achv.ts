import BattleScene from "../battle-scene";
import * as Utils from "../utils";

export enum AchvTier {
  COMMON,
  GREAT,
  ULTRA,
  MASTER
}

export class Achv {
  public id: string;
  public name: string;
  public description: string;
  public iconImage: string;
  public score: integer;

  public secret: boolean;
  public hasParent: boolean;
  public parentId: string;

  private conditionFunc: (scene: BattleScene, args: any[]) => boolean;

  constructor(name: string, description: string, iconImage: string, score: integer, conditionFunc?: (scene: BattleScene, args: any[]) => boolean) {
    this.name = name;
    this.description = description;
    this.iconImage = iconImage;
    this.score = score;
    this.conditionFunc = conditionFunc;
  }

  setSecret(hasParent?: boolean): this {
    this.secret = true;
    this.hasParent = !!hasParent;
    return this;
  }

  validate(scene: BattleScene, args: any[]): boolean {
    return !this.conditionFunc || this.conditionFunc(scene, args);
  }

  getTier(): AchvTier {
    if (this.score >= 250)
      return AchvTier.MASTER;
    if (this.score >= 100)
      return AchvTier.ULTRA;
    if (this.score >= 25)
      return AchvTier.GREAT;
    return AchvTier.COMMON;
  }
}

export class MoneyAchv extends Achv {
  private moneyAmount: integer;

  constructor(name: string, moneyAmount: integer, iconImage: string, score: integer) {
    super(name, `Accumulate a total of ₽${moneyAmount.toLocaleString('en-US')}`, iconImage, score, (scene: BattleScene, _args: any[]) => scene.money >= this.moneyAmount);

    this.moneyAmount = moneyAmount;
  }
}

export class DamageAchv extends Achv {
  private damageAmount: integer;

  constructor(name: string, damageAmount: integer, iconImage: string, score: integer) {
    super(name, `Inflict ${damageAmount.toLocaleString('en-US')} damage in one hit`, iconImage, score, (_scene: BattleScene, args: any[]) => (args[0] as Utils.NumberHolder).value >= this.damageAmount);

    this.damageAmount = damageAmount;
  }
}

export class HealAchv extends Achv {
  private healAmount: integer;

  constructor(name: string, healAmount: integer, iconImage: string, score: integer) {
    super(name, `Heal ${healAmount.toLocaleString('en-US')} HP at once with a move, ability, or held item`, iconImage, score, (_scene: BattleScene, args: any[]) => (args[0] as Utils.NumberHolder).value >= this.healAmount);

    this.healAmount = healAmount;
  }
}

export class LevelAchv extends Achv {
  private level: integer;

  constructor(name: string, level: integer, iconImage: string, score: integer) {
    super(name, `Level up a Pokémon to Lv${level}`, iconImage, score, (scene: BattleScene, args: any[]) => (args[0] as Utils.IntegerHolder).value >= this.level);

    this.level = level;
  }
}

export const achvs = {
  _10K_MONEY: new MoneyAchv('Money Haver', 10000, 'nugget', 10),
  _100K_MONEY: new MoneyAchv('Rich', 100000, 'big_nugget', 25).setSecret(true),
  _1M_MONEY: new MoneyAchv('Millionaire', 1000000, 'relic_gold', 100).setSecret(true),
  _10M_MONEY: new MoneyAchv('One Percenter', 10000000, 'coin_case', 250).setSecret(true),
  _250_DMG: new DamageAchv('Hard Hitter', 1000, 'lucky_punch', 10),
  _1000_DMG: new DamageAchv('Harder Hitter', 1000, 'lucky_punch_great', 25).setSecret(true),
  _2500_DMG: new DamageAchv('That\'s a Lotta Damage!', 2500, 'lucky_punch_ultra', 100).setSecret(true),
  _10000_DMG: new DamageAchv('One Punch Man', 10000, 'lucky_punch_master', 250).setSecret(true),
  _250_HEAL: new HealAchv('Novice Healer', 250, 'potion', 10),
  _1000_HEAL: new HealAchv('Big Healer', 1000, 'super_potion', 25).setSecret(true),
  _2500_HEAL: new HealAchv('Cleric', 2500, 'hyper_potion', 100).setSecret(true),
  _10000_HEAL: new HealAchv('Recovery Master', 10000, 'max_potion', 250).setSecret(true),
  LV_100: new LevelAchv('But Wait, There\'s More!', 50, 'rare_candy', 50).setSecret(),
  LV_250: new LevelAchv('Elite', 250, 'rarer_candy', 150).setSecret(true),
  LV_1000: new LevelAchv('To Go Even Further Beyond', 250, 'candy_jar', 400).setSecret(true),
  TRANSFER_MAX_BATTLE_STAT: new Achv('Teamwork', 'Baton pass to another party member with at least one stat maxed out', 'stick', 25),
  CATCH_LEGENDARY: new Achv('Legendary', 'Catch a legendary Pokémon', 'mb', 100).setSecret(),
  CATCH_MYTHICAL: new Achv('Mythical', 'Catch a mythical Pokémon', 'strange_ball', 100).setSecret(),
  SEE_SHINY: new Achv('Shiny', 'Find a shiny Pokémon in the wild', 'pb_gold', 150).setSecret(),
  HIDDEN_ABILITY: new Achv('Hidden Potential', 'Catch a Pokémon with a hidden ability', 'ability_charm', 150).setSecret(),
  CLASSIC_VICTORY: new Achv('Undefeated', 'Beat the game in classic mode', 'relic_crown', 250)
};

{
  (function() {
    const achvKeys = Object.keys(achvs);
    achvKeys.forEach((a: string, i: integer) => {
      achvs[a].id = a;
      if (achvs[a].hasParent)
        achvs[a].parentId = achvKeys[i - 1];
    });
  })();
}