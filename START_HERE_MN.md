# CMS v1.5.1: GitHub-аас Ubuntu сервер асаах хүртэл

Энэ заавар нь **одоо байгаа** `olympiad-submission-system/cms` Git repo, `olympiad-v1.5.1` branch, **Ubuntu 24.04** нэг сервер, Windows оролцогчдын компьютер гэсэн хувилбарт зориулагдсан. Бодит IP, Ubuntu хэрэглэгчийн нэр, нууц үгээ өөрийнхөөрөө солино. CMS v1.5.1-ийг энэ зааврыг бичсэн Windows компьютерт ажиллуулаагүй; Ubuntu дээрх командуудыг ажиллуулж байж баталгаажуулна.

**Одоогийн төлөв:** 1–2-р алхам хийгдсэн. Код `https://github.com/sodkoifswe/olympiad-cms` private repo-ийн `olympiad-v1.5.1` branch-д push хийгдсэн. Одоо Ubuntu сервертэй бол **3-р алхмаас** үргэлжлүүл; 1–2-р алхмын Git командыг давтан ажиллуулах шаардлагагүй.

```text
Windows админ PC ── GitHub руу код push
Ubuntu сервер     ── код clone ── CMS + PostgreSQL + isolate
Windows оролцогч  ── LAN ── http://<SERVER_IP>:8888/
```

GitHub-д **програмын код** хадгална. Бодлого, hidden test, оролцогчдын submission, онооны ажиллаж буй өгөгдөл Ubuntu серверийн PostgreSQL-д хадгалагдана. Нууц тохиргоо, backup болон тэмцээний нууц тестийг GitHub repo-д хийхгүй.

## 1. GitHub дээр хоосон repo үүсгэх

1. [github.com/new](https://github.com/new) руу өөрийн account-аар орно.
2. Repo нэрийг жишээлбэл `olympiad-cms` болгоно. `Private` сонгохыг зөвлөе.
3. `Add a README file`, `.gitignore`, `Choose a license`-ийг **сонгохгүй**. Орон нутгийн CMS repo-д README, license, Git түүх аль хэдийн бий.
4. `Create repository` дарж, гарсан SSH/HTTPS URL-ийг тэмдэглэнэ. Доорх жишээнд `<GITHUB_USER>`-ийг өөрийн account-ын нэрээр солино.

Нөгөө `sysco project`-ийн бүх төслийг энэ repo руу оруулахгүй. Зөвхөн `cms` folder өөрөө Git repo. Түүний гаднах судалгааны Markdown файлууд энд автоматаар орохгүй.

## 2. Windows terminal: CMS кодыг push хийх

VS Code-ийн terminal дээр `C:\...>` prompt харагдаж байвал **CMD** хэрэглэж байна. CMD-д folder-ийн замыг давхар хашилтаар бичиж, `cd /d` хэрэглэнэ:

```bat
cd /d "C:\Users\User 7382\Documents\sysco project\olympiad-submission-system\cms"
git status --short --branch
git branch --show-current
git submodule status
```

Хэрэв `PS C:\...>` prompt харагдвал **PowerShell** хэрэглэж байна. Түүнд дараах хувилбар тохирно:

```powershell
cd 'C:\Users\User 7382\Documents\sysco project\olympiad-submission-system\cms'
git status --short --branch
git branch --show-current
git submodule status
```

Branch `olympiad-v1.5.1` байх ёстой. `isolate`-ийн submodule мөрийн эхний тэмдэг нь `-` биш байх ёстой. Энэ checkout CMS v1.5.1 tag-ийн `7c9fec8aa1a25ec93d624aebf815804dd93df9db` commit дээр суурилсан.

Хэрэв `git commit` өмнө нь хэрэглэгчийн нэр/email тохируулаагүй гэж алдаа өгвөл **зөвхөн энэ repo-д**:

```bat
git config user.name "ТАНЫ НЭР"
git config user.email "ТАНЫ_GITHUB_EMAIL"
```

Энэ заавар болон `.gitignore`-ийн өөрчлөлтийг commit хийнэ. `git add .` хэрэглэхээс өмнө нууц файл байгаа эсэхийг үргэлж шалга.

```bat
git add .gitignore START_HERE_MN.md
git diff --cached --check
git diff --cached --stat
git commit -m "Add Ubuntu deployment guide"
```

Анх татсан үеийн `origin` нь CMS-ийн **албан** `cms-dev/cms` repo байсан. Түүнийг `upstream` нэрлээд өөрийн GitHub repo-г `origin` болгосон. Одоогийн repo дээр энэ өөрчлөлт аль хэдийн хийгдсэн; доорх командыг давтаж ажиллуулахгүй:

```bat
git remote rename origin upstream
git remote add origin https://github.com/sodkoifswe/olympiad-cms.git
git remote -v
git push -u origin olympiad-v1.5.1
```

Энэ хэсэг нь анхны тохиргооны бүртгэл юм. GitHub нэвтрэлт асуувал Git Credential Manager/браузераар нэвтэрнэ; GitHub account-ын password-ийг terminal-д Git password болгон оруулах арга ажиллахгүй байж болно.

GitHub repo дээр `olympiad-v1.5.1` branch, `START_HERE_MN.md`, `isolate` submodule харагдаж байгааг шалга. Энэ branch-ийг repo-гийн default branch болгон тохируулбал дараа нь clone хийхэд амар, гэхдээ доорх `-b` командад заавал шаардлагагүй.

## 3. Ubuntu серверийн эхний бэлтгэл

Ubuntu 24.04-ийг сервер дээр суулгаж, админ sudo эрхтэй хэрэглэгчээр орно. Тэмцээний LAN дотор өөрчлөгдөхгүй IP өгнө (жишээлбэл router-ийн DHCP reservation). Суулгалтын үед интернет хэрэгтэй; тэмцээний үеэр GitHub, apt, pip шаардахгүй байхаар бүгдийг урьдчилан бэлдэнэ.

```bash
lsb_release -a
stat -fc %T /sys/fs/cgroup
sudo apt-get update
sudo apt-get install -y git openssh-server build-essential g++ postgresql postgresql-client \
    python3.12 python3.12-venv python3.12-dev python3-pip \
    cgroup-lite libcap-dev libpq-dev libcups2-dev libyaml-dev libffi-dev zip
sudo systemctl enable --now postgresql
sudo systemctl enable --now ssh
```

`stat` командын хариу `cgroup2fs` байх ёстой. Өөр байвал `isolate`-ийн шаардлага биелээгүй байж болно; тэр орчныг зассаны дараа үргэлжлүүл. Өөр Ubuntu хувилбарын багцын нэр өөр байж болно. Нэмэлт хэлний compiler хэрэгтэй бол CMS-ийн `docs/Installation.rst`-ийг хар.

## 4. Private GitHub repo-г Ubuntu-оос унших эрх

**Repo private бол** серверт read-only SSH deploy key өгнө. Ubuntu хэрэглэгчийн `~/.ssh/id_ed25519.pub` аль хэдийн байгаа эсэхийг шалга. Шинэ серверт байхгүй бол:

```bash
ssh-keygen -t ed25519 -C 'olympiad-ubuntu'
cat ~/.ssh/id_ed25519.pub
```

`ssh-keygen`-ийн санал болгосон default замыг зөвшөөр. **Байгаа private key-г дарж сольж болохгүй.** `cat`-ийн гаргасан `.pub` мөрийг GitHub repo → **Settings → Deploy keys → Add deploy key** хэсэгт paste хий. `Allow write access`-ийг сонгохгүй. Private key (`~/.ssh/id_ed25519`)-г хэнд ч явуулахгүй.

Ubuntu дээр clone:

```bash
git clone --recurse-submodules --branch olympiad-v1.5.1 \
    git@github.com:sodkoifswe/olympiad-cms.git ~/cms
cd ~/cms
git submodule status
```

Анх GitHub SSH host key баталгаажуулах үед GitHub-ийн [албан fingerprint](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/githubs-ssh-key-fingerprints)-тай тулгаж зөвшөөр. Хэрэв repo-г **public** болговол deploy key хэрэггүй; `https://github.com/sodkoifswe/olympiad-cms.git` URL-аар clone хийж болно.

## 5. CMS болон `isolate`-ийг суулгах

`~/cms` folder дотроос:

```bash
sudo python3 prerequisites.py install
```

Энэ скрипт sandbox-ийг хөрвүүлж, `cmsuser` болон `/usr/local/etc/cms.conf` жишээ тохиргоог үүсгэнэ. Өөрийн Ubuntu хэрэглэгчийг `cmsuser` group-д нэмэхийг асуувал `Y` гэж хариулж, **гараад дахин нэвтэр**. Энэ group-д орсон хүн `isolate`-ийг өндөр эрхээр ажиллуулах боломжтой тул оролцогчдыг нэмэхгүй.

Дахин нэвтэрсний дараа:

```bash
cd ~/cms
groups
python3 -m venv ~/cms_venv
source ~/cms_venv/bin/activate
pip install -r requirements.txt
pip install .
```

`groups`-ийн үр дүнд `cmsuser` байх ёстой. Python virtual environment-ийг шинэ terminal бүрт `source ~/cms_venv/bin/activate` гэж идэвхжүүлнэ.

## 6. PostgreSQL database үүсгэх

`cmsuser` нэртэй **PostgreSQL role** нь өмнөх Linux group-ээс тусдаа. `createuser` password асуухад санамсаргүй хүчтэй password үүсгэж аюулгүй хадгал. JSON URL мөрөнд шууд хэрэглэхийн тулд тусгай тэмдэгтгүй hex password сонгож болно.

```bash
sudo -u postgres createuser --pwprompt cmsuser
sudo -u postgres createdb --owner=cmsuser cmsdb
sudo -u postgres psql --dbname=cmsdb --command='ALTER SCHEMA public OWNER TO cmsuser'
sudo -u postgres psql --dbname=cmsdb --command='GRANT SELECT ON pg_largeobject TO cmsuser'
```

Эдгээрийг шинэ сервер дээр **нэг удаа** ажиллуулна. Repo-г `git pull` хийх бүрт database-г дахин үүсгэхгүй.

Хэрэв database password хаа нэг газар ил болсон бол PostgreSQL role-ийг дахин үүсгэхгүй; `sudo -u postgres psql`-д орж `\password cmsuser` гэж ажиллуулан шинэ password-ийг хоёр удаа оруулж, `\q`-ээр гарна. Дараа нь `/usr/local/etc/cms.conf` доторх **байгаа** `database` мөрийг мөн шинэ password-д тааруулна. Нууц үгийг чат, screenshot, Git-д бүү оруул.

## 7. Серверийн нууц config

```bash
sudo nano /usr/local/etc/cms.conf
```

**Шинэ JSON блок нэмж paste хийхгүй.** `cms.conf` sample дотор эдгээр түлхүүр бүр аль хэдийн байна. `Ctrl+W`-ээр түлхүүрийг олж, тухайн **байгаа мөрийн утгыг л** солино. Нэг түлхүүрийг хоёр удаа бичвэл JSON шалгалт давж байсан ч тохиргоо буруу ойлгогдож болно.

| Байгаа түлхүүр | Тохируулах утга |
| --- | --- |
| `database` | `postgresql+psycopg2://cmsuser:<DB_PASSWORD>@localhost:5432/cmsdb` |
| `secret_key` | `openssl rand -hex 16`-аар гаргасан **шинэ** 32 тэмдэгттэй hex утга |
| `admin_listen_address` | `127.0.0.1` |
| `contest_listen_address` | `["0.0.0.0"]` |
| `rankings` | `[]` (тусдаа RankingWebServer асаахгүй үед) |

`<DB_PASSWORD>`-ийн оронд PostgreSQL role-д өгсөн бодит password-ийг оруулна. URL-д `@`, `/`, `:` зэрэг тусгай тэмдэгт байвал URL encode хийх шаардлагатай; эхний тохиргоонд урт санамсаргүй **hex** password ашиглахад хялбар. `core_services` доторх `Worker` жагсаалтыг эхний туршилтад **нэг** worker `[["localhost", 26000]]` болгоно; sample-д 16 байдаг.

```bash
sudo python3 -m json.tool /usr/local/etc/cms.conf >/dev/null && echo 'JSON OK'
```

Config нь `cmsuser`-ийн унших эрхтэй файл учир энгийн хэрэглэгчээр `json.tool` ажиллуулахад `Permission denied` гарч болно. Дээрх `sudo` шалгалт `JSON OK` гэж гарвал syntax зөв. `/usr/local/etc/cms.conf` болон database password-ийг Git-д бүү нэм. `config/cms.conf.sample`-ийг шууд бодит тэмцээнд ашиглахгүй.

## 8. DB schema, admin account, анхны contest

```bash
source ~/cms_venv/bin/activate
cmsInitDB
cmsAddAdmin admin
cmsAdminWebServer
```

`cmsInitDB`-г **зөвхөн шинэ хоосон database-д нэг удаа** ажиллуул. `cmsAddAdmin`-ийн хэвлэсэн нууц үгийг хадгал. Админ хуудас Ubuntu машин дээр `http://localhost:8889/`.

Хэрэв Ubuntu сервер дэлгэцгүй, админ Windows PC-ээс орох бол Windows PowerShell-ийн **өөр** цонхонд:

```powershell
ssh -L 8889:127.0.0.1:8889 <UBUNTU_USER>@<SERVER_IP>
```

Тэр SSH цонх нээлттэй байх үед Windows браузераар `http://localhost:8889/` нээнэ. Админ нэвтрээд **Contests → New contest**-оор тэмцээн үүсгэнэ. Дараа нь standalone `cmsAdminWebServer` ажиллаж буй Ubuntu terminal-д `Ctrl+C` дарж зогсооно. Үргэлжлүүлэхэд тэмцээний өгөгдөл database-д хадгалагдсан байна.

## 9. Бүх service-ийг асаах

Ubuntu дээр **хоёр тусдаа terminal/SSH session** нээнэ. Нэгдүгээрт:

```bash
source ~/cms_venv/bin/activate
cmsLogService
```

Хоёрдугаарт:

```bash
source ~/cms_venv/bin/activate
cmsResourceService -a
```

`cmsResourceService -a` тэмцээн сонгохыг асуухад 8-р алхамд үүсгэсэн contest-оо сонгоно. Энэ terminal-ууд хаагдвал service-үүд зогсож болно; эхний туршилтад нээлттэй байлга. Бодит тэмцээний өмнө reboot-оос автоматаар сэргэх `systemd`/service management болон startup туршилтыг тусад нь бэлдэнэ.

Admin URL сервер дээр `http://localhost:8889/` (Windows-оос SSH tunnel-ээр мөн адил). Оролцогчийн URL `http://<SERVER_IP>:8888/`. Серверийн IP-г `hostname -I` командаар харна. Firewall идэвхтэй бол 8888 TCP-г **зөвхөн оролцогчдын LAN subnet-д** нээнэ; PostgreSQL 5432, admin 8889, CMS-ийн 2xxxx дотоод port-уудыг оролцогчдод нээхгүй. `sudo ufw status`-аар эхлээд байдлыг нь шалга; remote SSH холболтоо хаахгүйн тулд firewall-г шууд enable хийхээс өмнө SSH эрхээ тохируул.

Жишээ нь оролцогчдын LAN `192.168.1.0/24` бол firewall аль хэдийн идэвхтэй үед:

```bash
sudo ufw status
sudo ufw allow from 192.168.1.0/24 to any port 8888 proto tcp
```

Өөр subnet ашигладаг бол жишээ хаягийг солино. UFW идэвхгүй байвал энэ rule дангаараа хамгаалалт идэвхжүүлэхгүй; SSH болон сүлжээний бусад дүрмээ шалгаж байж UFW-г асаана.

## 10. Бодлого ба оролцогч нэмээд end-to-end турших

Бүрэн service ассан admin хуудсанд:

1. **Tasks → New task**: богино нэр өгнө. CMS v1.5.1 default-аар `Batch`, нэг dataset, `taskname.%l` submission format үүсгэдэг. Dataset-ийн time/memory limit, score type-ийг бодлогын дүрэмдээ тааруул.
2. Task дотроос PDF **statement** upload хий. Жишээ оролт/гаралтыг PDF-д бичнэ. Hidden test-үүдийг dataset-ийн **Upload testcase** эсвэл **Upload testcases**-аар input/output хосоор нь оруулна. Оролцогчид үр дүнг харуулахгүй бол `Public`-ийг тэмдэглэхгүй.
3. Contest → **Tasks → Add task**: дээр үүсгэсэн task-ийг тэмцээнд холбож өгнө.
4. **Users → New user**, дараа Contest → **Users → Add user**: туршилтын оролцогчийг тэмцээнд холбож өгнө. Нэвтрэх password-ийг хадгал.
5. Contest-ийн start/stop цагийг туршилт хийхээр тохируул. `Asia/Ulaanbaatar` timezone, C++ хэлний сонголт, feedback/token дүрмийг шалга.
6. Оролцогчийн Windows PC-ээс `http://<SERVER_IP>:8888/` нээж, туршилтын user-ээр login хийнэ. Dev-C++ дээр `cin/cout` хэрэглэсэн энгийн `.cpp` илгээж, компайл, hidden test үнэлгээ, оноо гарч байгааг шалга.

CMS-ийн Batch бодлогын input/output файлын нэрийг хоосон орхивол stdin/stdout хэрэглэнэ. `Public` testcase ч гэсэн **оролт, зөв гаралтын файлыг оролцогчид харуулахгүй**, зөвхөн тухайн test-ийн үр дүнгийн мэдээлэл гардаг. Private testcase-ийн үр дүнг token нээж болдог тул тэмцээний дүрмийг тохируул.

## 11. Backup, интернетгүй туршилт, дараагийн асаалт

Тэмцээний өмнө болон явцад database-ийн backup аваад **өөр диск/компьютерт** хуул:

```bash
mkdir -p ~/cms-backups
sudo -u postgres pg_dump -Fc cmsdb > ~/cms-backups/cmsdb-$(date +%F-%H%M).dump
```

Нууц config, бодлогын анхны PDF/test, backup-ийн сэргээх зааврыг мөн тусад нь хадгал. CMS-ийн `cmsDumpExporter` нь тэмцээний өгөгдлийг хувилбар шинэчлэхэд экспортлох зориулалттай. `git pull` нь database-ийн backup биш. Тэмцээний өмнө нэг удаа backup-аас **өөр туршилтын database** руу сэргээж шалга.

Дараагийн удаа код татахдаа Ubuntu дээр:

```bash
cd ~/cms
git pull --ff-only
git submodule update --init --recursive
```

CMS-ийн хувилбар/DB schema өөрчлөхийн өмнө заавал export болон backup хий. Репо дахь кодыг өөрчлөхгүйгээр Ubuntu-г дахин асаахад database хэвээр; PostgreSQL-ийг эхлүүлээд 9-р алхмын service-үүдийг дахин ажиллуулна. Тэмцээний өмнө интернетийг салгаад **cold reboot**, login, PDF таталт, `.cpp` submission, үнэлгээ, backup ажиллагааг давтан турш.

## Эх сурвалж

- [GitHub: local repo-г шинэ repo руу push хийх](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github)
- [CMS v1.5.1: Installation](https://cms.readthedocs.io/en/v1.5/Installation.html)
- [CMS v1.5.1: Running CMS](https://cms.readthedocs.io/en/v1.5/Running%20CMS.html)
- [CMS v1.5.1: Creating a contest](https://cms.readthedocs.io/en/v1.5/Creating%20a%20contest.html)
- [CMS v1.5.1: Task types](https://cms.readthedocs.io/en/v1.5/Task%20types.html)
- [PostgreSQL: pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html)
