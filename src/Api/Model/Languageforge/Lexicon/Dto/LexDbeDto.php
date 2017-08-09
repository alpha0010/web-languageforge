<?php

namespace Api\Model\Languageforge\Lexicon\Dto;

use Api\Model\Languageforge\Lexicon\Command\SendReceiveCommands;
use Api\Model\Languageforge\Lexicon\Config\LexConfig;
use Api\Model\Languageforge\Lexicon\LexCommentListModel;
use Api\Model\Languageforge\Lexicon\LexDeletedEntryListModel;
use Api\Model\Languageforge\Lexicon\LexDeletedCommentListModel;
use Api\Model\Languageforge\Lexicon\LexEntryListModel;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Shared\Command\ActivityCommands;
use Api\Model\Shared\Dto\ActivityListDto;
use Api\Model\Shared\Dto\ActivityListModel;
use Api\Model\Shared\UserGenericVoteModel;

class LexDbeDto
{
    const MAX_ENTRIES_PER_REQUEST = 1000;

    /**
     * @param string $projectId
     * @param string $userId
     * @param null $lastFetchTime
     * @param int $offset
     * @throws \Exception
     * @return array
     */
    public static function encode($projectId, $userId, $lastFetchTime = null, $offset = 0)
    {
        $data = [];
        $project = new LexProjectModel($projectId);
        $activity = [];
        if ($lastFetchTime) {
            $entriesModel = new LexEntryListModel($project, $lastFetchTime);
            $entriesModel->readAsModels();
            $commentsModel = new LexCommentListModel($project, $lastFetchTime);
            $commentsModel->readAsModels();
            $activity = ActivityListDto::getActivityForProject($project, $lastFetchTime);
        } else {
            $entriesModel = new LexEntryListModel($project, null, self::MAX_ENTRIES_PER_REQUEST, $offset);
            $entriesModel->readAsModels();
            $commentsModel = new LexCommentListModel($project, null, self::MAX_ENTRIES_PER_REQUEST, $offset);
            $commentsModel->readAsModels();
            $activity = ActivityListDto::getActivityForProject($project, null, self::MAX_ENTRIES_PER_REQUEST, $offset);

            $counts = [$commentsModel->totalCount, $entriesModel->totalCount, count($activity)];
            rsort($counts);
            $data['itemTotalCount'] = $counts[0];
            $counts = [$commentsModel->count, $entriesModel->count, count($activity)];
            rsort($counts);
            $data['itemCount'] = $counts[0];
            $data['offset'] = $offset;
        }
        $entries = LexDbeDtoEntriesEncoder::encode($entriesModel);
        $entries = $entries['entries'];
        $encodedComments = LexDbeDtoCommentsEncoder::encode($commentsModel);
        $data['comments'] = $encodedComments['entries'];
        $data['activity'] = $activity;

        $votes = new UserGenericVoteModel($userId, $projectId, 'lexCommentPlusOne');
        $votesDto = [];
        foreach ($votes->votes as $vote) {
            $votesDto[$vote->ref->id] = true;
        }
        $data['commentsUserPlusOne'] = $votesDto;

        if (!is_null($lastFetchTime)) {
            $deletedEntriesModel = new LexDeletedEntryListModel($project, $lastFetchTime);
            $deletedEntriesModel->read();
            $data['deletedEntryIds'] = array_map(function ($e) {return $e['id']; }, $deletedEntriesModel->entries);

            $deletedCommentsModel = new LexDeletedCommentListModel($project, $lastFetchTime);
            $deletedCommentsModel->read();
            $data['deletedCommentIds'] = array_map(function ($c) {return $c['id']; }, $deletedCommentsModel->entries);
        }

        $data['entries'] = $entries;

        $data['timeOnServer'] = time(); // for offline syncing

        if ($project->hasSendReceive()) {
            $data['sendReceive'] = array();
            $data['sendReceive']['status'] = SendReceiveCommands::getProjectStatus($projectId);
        }

        return $data;
    }
}
