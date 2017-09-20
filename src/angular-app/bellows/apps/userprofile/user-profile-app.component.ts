import * as angular from 'angular';

import { UserService } from '../../core/api/user.service';
import { ModalService } from '../../core/modal/modal.service';
import { NoticeService } from '../../core/notice/notice.service';
import { UtilityService } from '../../core/utility.service';
import { UserProfile } from '../../shared/model/user-profile.model';

interface UserProfileAppControllerScope extends angular.IScope {
  userprofileForm: angular.IFormController;
}

export class UserProfileAppController implements angular.IController {
  getAvatarUrl = this.util.getAvatarUrl;
  projectsSettings: any[];
  emailValid = true;
  usernameValid = true;
  originalUsername = '';
  takenEmail = '';
  takenUsername = '';
  country = 'us';
  user = new UserProfile();
  emailExists: boolean;
  usernameExists: boolean;
  readonly allCountries = require('ng-intl-tel-mini/gen/data.js'); // exports allCountries
  readonly dropdown = {
    avatarColors: {},
    avatarShapes: {}
  };

  private initColor = '';
  private initShape = '';

  static $inject = ['$scope', '$window',
    'userService', 'modalService',
    'silNoticeService', 'utilService'];
  constructor(private $scope: UserProfileAppControllerScope, private $window: angular.IWindowService,
              private userService: UserService, private modalService: ModalService,
              private notice: NoticeService, private util: UtilityService) {}

  $onInit(): void {
    this.user.avatar_ref = UserProfileAppController.getAvatarRef('', '');

    this.$scope.$watch(() => { return this.user.avatar_color; }, () => {
      this.user.avatar_ref = UserProfileAppController.getAvatarRef(this.user.avatar_color, this.user.avatar_shape);
    });

    this.$scope.$watch(() => { return this.user.avatar_shape; }, () => {
      this.user.avatar_ref = UserProfileAppController.getAvatarRef(this.user.avatar_color, this.user.avatar_shape);
    });

    this.loadUser(); // load the user data right away

    this.dropdown.avatarColors = [
      { value: 'purple4', label: 'Purple' },
      { value: 'green', label: 'Green' },
      { value: 'chocolate4', label: 'Chocolate' },
      { value: 'turquoise4', label: 'Turquoise' },
      { value: 'LightSteelBlue4', label: 'Steel Blue' },
      { value: 'DarkOrange', label: 'Dark Orange' },
      { value: 'HotPink', label: 'Hot Pink' },
      { value: 'DodgerBlue', label: 'Blue' },
      { value: 'plum', label: 'Plum' },
      { value: 'red', label: 'Red' },
      { value: 'gold', label: 'Gold' },
      { value: 'salmon', label: 'Salmon' },
      { value: 'DarkGoldenrod3', label: 'Dark Golden' },
      { value: 'chartreuse', label: 'Chartreuse' },
      { value: 'LightBlue', label: 'Light Blue' },
      { value: 'LightYellow', label: 'Light Yellow' }
    ];

    this.dropdown.avatarShapes = [
      { value: 'camel', label: 'Camel' },
      { value: 'cow', label: 'Cow' },
      { value: 'dog', label: 'Dog' },
      { value: 'elephant', label: 'Elephant' },
      { value: 'frog', label: 'Frog' },
      { value: 'gorilla', label: 'Gorilla' },
      { value: 'hippo', label: 'Hippo' },
      { value: 'horse', label: 'Horse' },
      { value: 'kangaroo', label: 'Kangaroo' },
      { value: 'mouse', label: 'Mouse' },
      { value: 'otter', label: 'Otter' },
      { value: 'pig', label: 'Pig' },
      { value: 'rabbit', label: 'Rabbit' },
      { value: 'rhino', label: 'Rhino' },
      { value: 'sheep', label: 'Sheep' },
      { value: 'tortoise', label: 'Tortoise' }
    ];

  }

  validateForm(): void {
    this.emailValid = this.$scope.userprofileForm.email.$pristine ||
      (this.$scope.userprofileForm.email.$dirty && !this.$scope.userprofileForm.$error.email);

    this.usernameValid = this.$scope.userprofileForm.username.$pristine ||
      (this.$scope.userprofileForm.username.$dirty && !this.$scope.userprofileForm.$error.username);

    this.userService.checkUniqueIdentity(this.user.id, this.user.username, this.user.email,
       (result) => {
      if (result.ok) {
        switch (result.data) {
          case 'usernameExists' :
            this.usernameExists = true;
            this.emailExists = false;
            this.takenUsername = this.user.username.toLowerCase();
            this.$scope.userprofileForm.username.$setPristine();
            break;
          case 'emailExists' :
            this.usernameExists = false;
            this.emailExists = true;
            this.takenEmail = this.user.email.toLowerCase();
            this.$scope.userprofileForm.email.$setPristine();
            break;
          case 'usernameAndEmailExists' :
            this.usernameExists = true;
            this.emailExists = true;
            this.takenUsername = this.user.username.toLowerCase();
            this.takenEmail = this.user.email.toLowerCase();
            this.$scope.userprofileForm.username.$setPristine();
            this.$scope.userprofileForm.email.$setPristine();
            break;
          default:
            this.usernameExists = false;
            this.emailExists = false;
        }
      }
    });
  };

  submit(): void {
    if (this.user.username !== this.originalUsername) {
      // Confirmation for username change
      const message = 'Changing Username from <b>' + this.originalUsername + '</b> to <b>' +
        this.user.username + '</b> will force you to login again.<br /><br />' +
        'Do you want to save changes?';
      const modalOptions = {
        closeButtonText: 'Cancel',
        actionButtonText: 'Save changes',
        headerText: 'Changing username?',
        bodyText: message
      };
      this.modalService.showModal({}, modalOptions).then(() => {
        this.updateUser();

        // catch is necessary to properly implement promise API, which angular 1.6 complains if we
        // don't have a catch
      }).catch(() => {});
    } else {
      this.updateUser();
    }
  };

  // noinspection JSUnusedLocalSymbols
  isValid($isValid: boolean, $error: number, $phoneNumber: string, $inputVal: string): void {
    if (!$inputVal) {
      return;
    }

    this.user.mobile_phone = $inputVal;
    for (let country of this.allCountries) {
      if ($inputVal.startsWith(country.dialCode) || $inputVal.startsWith('+' + country.dialCode)) {
        this.country = country.iso2;
      }
    }
  }

  private loadUser(): void {
    this.userService.readProfile((result) => {
      if (result.ok) {
        this.user = result.data.userProfile;
        this.originalUsername = this.user.username;
        this.initColor = this.user.avatar_color;
        this.initShape = this.user.avatar_shape;
        this.projectsSettings = result.data.projectsSettings;
        this.$scope.$broadcast('ng-intl-tel-mini.setNumber', this.user.mobile_phone);

        // populate the project pickList default values with the userProfile picked values
        for (let i = 0; i < this.projectsSettings.length; i++) {
          let project = this.projectsSettings[i];
          if (project.userProperties && project.userProperties.userProfilePickLists) {
            angular.forEach(project.userProperties.userProfilePickLists,
              (pickList, pickListId) => {
                // ensure user has profile data
                if (this.user.projectUserProfiles[project.id]) {
                  if (this.user.projectUserProfiles[project.id][pickListId])
                    this.projectsSettings[i].userProperties.userProfilePickLists[pickListId]
                      .defaultKey = this.user.projectUserProfiles[project.id][pickListId];
                }
              }
            );
          }
        }
      }
    });
  };

  private updateUser(): void {
    // populate the userProfile picked values from the project pickLists
    for (let i = 0; i < this.projectsSettings.length; i++) {
      let project = this.projectsSettings[i];
      this.user.projectUserProfiles[project.id] = {};
      if (project.userProperties && project.userProperties.userProfilePickLists) {
        angular.forEach(project.userProperties.userProfilePickLists,
          (pickList, pickListId) => {
            this.user.projectUserProfiles[project.id][pickListId] = pickList.defaultKey;
          }
        );
      }
    }

    this.userService.updateProfile(this.user, (result) => {
      if (result.ok) {
        if (this.user.avatar_color !== this.initColor || this.user.avatar_shape !== this.initShape) {
          const newAvatarUrl = this.getAvatarUrl(this.user.avatar_ref);
          ['mobileSmallAvatarURL', 'smallAvatarURL'].forEach((id) => {
            const imageElement = this.$window.document.getElementById(id) as HTMLImageElement;
            imageElement.src = newAvatarUrl;
          });
        }

        if (result.data === 'login') {
          this.notice.push(this.notice.SUCCESS, 'Username changed. Please login.');
          this.$window.location.href = '/auth/logout';
        } else {
          this.notice.push(this.notice.SUCCESS, 'Profile updated successfully');
        }
      }
    });
  };

  private static getAvatarRef(color?: string, shape?: string): string {
    if (!color || !shape) {
      return 'anonymoose.png';
    }

    return color + '-' + shape + '-128x128.png';
  }

}

export const UserProfileAppComponent: angular.IComponentOptions = {
  controller: UserProfileAppController,
  templateUrl: '/angular-app/bellows/apps/userprofile/user-profile-app.component.html'
};