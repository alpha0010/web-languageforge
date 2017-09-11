#!/bin/bash -x
echo -e "
Notice: This installer assumes the following:\n\n
- it is being run on a fresh Ubuntu Xenial on Windows installation.\n
- it is being run from a source directory (e.g. /mnt/c/src ) where the web-languageforge repo will be cloned.\n
\n
  If this is not the case, continue at your own risk\n
\n
In the off chance that you want to completely remove and reinstall Xenial Bash on Windows 10,\n
 you can run these commands before running this script:\n
 \n
lxrun /uninstall /full \n
lxrun /install \n
\n\n"

read -n 1 -s -r -p "Press any key to start the xForge developer environment install process"
sudo echo -e "\n\n"

echo "Updating / Upgrading with apt"
wget -O- http://linux.lsdev.sil.org/downloads/sil-testing.gpg | sudo apt-key add -
sudo add-apt-repository -y 'deb http://linux.lsdev.sil.org/ubuntu xenial main'
sudo add-apt-repository -y 'deb http://linux.lsdev.sil.org/ubuntu xenial-experimental main'
sudo add-apt-repository -y ppa:ansible/ansible
sudo apt update && sudo apt -y upgrade

echo "Install NodeJS 8.X and latest npm"
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "Installing packages"
sudo apt install -y git ansible php7.0-cli libapache2-mod-php mongodb-server p7zip-full php7.0-dev php7.0-gd php7.0-intl php7.0-mbstring php-pear php-xdebug postfix unzip lfmerge

echo "Cloning web-languageforge repo into the current directory... Is this what you want to do?  (If not, Ctrl-C and change this script)"
read -n 1 -s -r -p "Press any key to continue"
git clone --recurse-submodules https://github.com/sillsdev/web-languageforge
cd web-languageforge\deploy

echo "Running xforge web developer ansible scripts"
ansible-playbook -i hosts playbook_create_config.yml --limit localhost -K
ansible-playbook -i hosts playbook_webdeveloper_bash_windows10.yml --limit localhost -K

echo "Refreshing xForge dependencies"
cd ..
./refreshDeps.sh

echo "Modifying windows hosts file"
echo -e "\n127.0.0.1\tlanguageforge.local\n" >> /mnt/c/Windows/System32/drivers/etc/hosts
echo -e "\n127.0.0.1\tscriptureforge.local\n" >> /mnt/c/Windows/System32/drivers/etc/hosts
echo -e "\n127.0.0.1\tjamaicanpsalms.scriptureforge.local\n" >> /mnt/c/Windows/System32/drivers/etc/hosts

echo "Factory Reset the database"
cd scripts/tools
php FactoryReset.php run

echo "You should now be able to access Language Forge locally at http://languageforge.local"
