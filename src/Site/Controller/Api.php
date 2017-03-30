<?php

namespace Site\Controller;

use Api\Library\Shared\Palaso\JsonRpcServer;
use Api\Service\Sf;
use Silex\Application;
use Symfony\Component\HttpFoundation\Request;

class Api
{
    public function service(Request $request, Application $app, $apiName, $args = '') {

        $service = new Sf($app);

        // TODO: rename sf to jsonrpc
        if ($apiName == 'sf') {
            return $app->json(JsonRpcServer::handle($request, $service), 200);
        } else {
            return $app->json(RestServer::handle($request, $service, $args), 200);
        }

    }

}
