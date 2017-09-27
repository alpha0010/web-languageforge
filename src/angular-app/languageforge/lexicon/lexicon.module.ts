import * as angular from 'angular';

import { LexiconCoreModule } from './core/lexicon-core.module';

import './lexicon.scss';
import './new-project/new-project.scss';

// these are imported here to ensure JS files can use them
import '../../bellows/core/input-systems/input-systems.service';
import './views/configuration';

export const LexiconModule = angular
  .module('lexiconModule', [LexiconCoreModule])
  .name;
