<?php

namespace Api\Model\Shared\Command;


use Api\Library\Shared\Website;
use Api\Model\Shared\UserModel;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\RequestException;

class JiraApi
{
    private $client;

    private $jiraProject;

    private $shouldSendRequest;

    private $userEmail;

    private $apiUsername;

    private $apiPassword;

    private $apiEndpoint;

    public function __construct(Website $website, ClientInterface $client = null)
    {
        $this->client = $client;
        $this->jiraProject = ($website->base == 'languageforge') ? 'LF' : 'SF';
        $this->shouldSendRequest = ($website->isProduction) ? true : false;
        $jiraAuthFilename = APPPATH . '../jiraAuth.json';
        if (file_exists($jiraAuthFilename)) {
            $auth = json_decode(file_get_contents($jiraAuthFilename));
            $this->apiUsername = ($website->base == 'languageforge') ? 'languageforgeissues' : 'scriptureforgeissues';
            $this->apiPassword = $auth['password'];
            $this->apiEndpoint = $auth['endpoint'];
        }
    }

    /**
     * @param string $jiraIssueId
     * @param string $comment
     * @return bool - true if comment created successfully, false otherwise
     */
    public function commentOnJiraIssue($jiraIssueId, $comment) {
        $commentJson = [ 'body' => $comment ];
        return $this->apiPost("issue/$jiraIssueId/comment", $commentJson);
    }

    /**
     * @param string $title
     * @return mixed - issue id if found, otherwise false
     */
    public function getJiraIssueByTitle($title) {
        // not entirely sure how to use JQL (JIRA Query Language)

        // Todo: search for open issue
        $searchJson = [
            'jql' => "summary = '$title'",
            'maxResults' => 1
            ];

        // https://docs.atlassian.com/jira/REST/cloud/#api/2/search
        $result = $this->apiPost('search', $searchJson);
        if (is_array($result) && count($result['issues']) == 1 ) {
            return $result['issues'][0]['id'];
        }
        return false;
    }

    /**
     * @param string $title
     * @param string $description
     * @param string $jiraReporterUsername
     * @return bool true if issue was created, false otherwise
     */
    public function createJiraIssue($title, $description, $jiraReporterUsername ='') {
        $issueJson = [
            'fields' => [
                'project' => [
                    'key' => $this->jiraProject
                ],
                'summary' => $title,
                'description' => $description
            ]
        ];
        if ($jiraReporterUsername) {
            $issueJson['fields']['reporter'] = ['username' => $jiraReporterUsername];
        }
        return $this->apiPost('issue', $issueJson);
    }

    public function createJiraUser() {
        // I don't know if we can do this without an admin account
        // the intention is to auto-create users if we can't find an email match, just like the email plugin auto-creates issues
        // if we can't actually create an user, then we should just not specify a reporter
    }

    /**
     * @param string $email
     * @return string - username or empty string if not found
     */
    public function getJiraUserByEmail($email) {
        // https://docs.atlassian.com/jira/REST/cloud/#api/2/user-findUsers
        $result = $this->apiGet("user/search?username=$email");
        if (is_array($result) && count($result) > 0) {
            return $result[0]['key'];
        }
        return '';
    }

    private function apiPost($url, $json) {
        try {
            if ($this->shouldSendRequest) {
                $response = $this->client->post($this->apiEndpoint . $url, [
                    'auth' => [$this->apiUsername, $this->apiUsername],
                    'json' => $json
                ]);
            }
            return true;
        } catch (RequestException $e) {
            $response = $e->getResponse();
            return false;
        }
    }

    private function apiGet($url) {
        try {
            if ($this->shouldSendRequest) {
                $response = $this->client->get($this->apiEndpoint . $url, [
                    'auth' => [$this->apiUsername, $this->apiUsername]
                ]);
                return $response->json();
            }
        } catch (RequestException $e) {
            $response = $e->getResponse();
            return false;
        }
        return true;
    }
}
class JiraCommands
{
    public static function createIssueFromUserFeedback(Website $website, $userId, $message, ClientInterface $client = null) {
        $title = substr($message, 0, 30);
        $user = new UserModel($userId);
        $email = $user->email || $user->emailPending;
        $api = new JiraApi($website, $client);
        $jiraUserName = $api->getJiraUserByEmail($email);
        $api->createJiraIssue($title, $message, $jiraUserName);
    }

    public static function createIssueFromExceptionReport(Website $website, $userId, $title, $message, ClientInterface $client = null) {
        $user = new UserModel($userId);
        $email = $user->email || $user->emailPending;
        $api = new JiraApi($website, $client);

        // TODO append useful information about the xforge user to the message;
        $messageHeader = "\n\n";
        $message = $messageHeader . $message;

        $issueId = $api->getJiraIssueByTitle($title);
        if ($issueId) {
            $api->commentOnJiraIssue($issueId, $message);
        } else {
            $jiraUserName = $api->getJiraUserByEmail($email);
            $api->createJiraIssue($title, $message, $jiraUserName);
        }
    }

}
