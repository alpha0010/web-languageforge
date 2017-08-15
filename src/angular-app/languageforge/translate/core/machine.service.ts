/// <reference path='excluded/machine.d.ts' />

'use strict';

import './excluded/machine.js';

import machine = SIL.Machine.Translation;

export class MachineService {
  private engine: machine.TranslationEngine;
  private session: machine.InteractiveTranslationSession;

  // SIL.Machine.Translation.TranslationEngine.ctor(baseUrl, projectId)
  initialise(projectId: string): void {
    this.engine = new machine.TranslationEngine(location.origin + '/machine', projectId);
  }

  // SIL.Machine.Translation.TranslationEngine.translateInteractively(sourceSegment,
  //    confidenceThreshold, onFinished)
  translateInteractively(sourceSegment: string, confidenceThreshold: number, callback?: () => void): void {
    if (!this.engine) return;

    this.engine.translateInteractively(sourceSegment, confidenceThreshold, newSession => {
      if (newSession) {
        this.session = newSession;
      }

      if (callback) callback();
    });
  };

  // SIL.Machine.Translation.TranslationEngine.train(onStatusUpdate, onFinished)
  train(onStatusUpdate: (progress: machine.SmtTrainProgress) => void, onFinished: (success: boolean) => void): void {
    if (!this.engine) return;

    this.engine.train(onStatusUpdate, onFinished);
  }

  // SIL.Machine.Translation.TranslationEngine.listenForTrainingStatus(onStatusUpdate, onFinished)
  listenForTrainingStatus(onStatusUpdate: (progress: machine.SmtTrainProgress) => void, onFinished: (success: boolean) => void): void {
    if (!this.engine) return;

    this.engine.listenForTrainingStatus(onStatusUpdate, onFinished);
  }

  // SIL.Machine.Translation.InteractiveTranslationSession.updatePrefix(prefix)
  updatePrefix(prefix: string): string[] {
    if (!this.engine || !this.session) return;

    // returns suggestions
    return this.session.updatePrefix(prefix);
  }

  getCurrentSuggestion(): string[] {
    if (!this.engine || !this.session) return;

    return this.session.currentSuggestion;
  }

  // SIL.Machine.Translation.InteractiveTranslationSession.approve(onFinished)
  learnSegment(callback: (success: boolean) => void): void {
    if (!this.engine || !this.session) return;

    this.session.approve(callback);
  }
}