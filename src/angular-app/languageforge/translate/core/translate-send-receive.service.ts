import * as angular from 'angular';

import { TranslateSendReceiveApiService } from '../core/translate-send-receive-api.service';
import { SendReceiveJob } from '../shared/model/send-receive-job.model';

export class TranslateSendReceiveService {
  private job: SendReceiveJob;

  static $inject: string[] = ['translateSendReceiveApiService'];
  constructor(private translateSendReceiveApiService: TranslateSendReceiveApiService) { }

  startJob(projectId: string): angular.IPromise<void> {
    return this.translateSendReceiveApiService.startJob(projectId).then(job => {
      this.job = job;
      // TODO: start polling timer
    });
  }
}
