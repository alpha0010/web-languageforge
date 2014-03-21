<?php

namespace models\shared\dto;

use models\mapper\JsonEncoder;
use models\UserModel;
use models\ProjectModel;

class ProjectUsersDto {
	
	/**
	 * @param string $projectId
	 * @param string $userId
	 * @returns array - the DTO array
	 */
	public static function encode($projectId, $userId) {
		$userModel = new UserModel($userId);
		$projectModel = new ProjectModel($projectId);

		$list = $projectModel->listUsers();
		$data = array();
		$data['count'] = $list->count;
		$data['entries'] = $list->entries;
		$data['project'] = JsonEncoder::encode($projectModel);
		unset($data['project']['users']);
		$data['rights'] = RightsHelper::encode($userModel, $projectModel);
		return $data;
	}
}

?>
