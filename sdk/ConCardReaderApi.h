#ifndef  _CON_CARD_READER_H
#define  _CON_CARD_READER_H

#ifdef WIN32
#ifdef _CONCR_EXPORTS
#define ConCardReader_EXPORT_     extern "C" __declspec(dllexport)
#else
#define  ConCardReader_EXPORT_    extern "C"__declspec(dllimport)
#endif

#else

#define ConCardReader_EXPORT_    
#define CALLBACK  
#endif   //#ifdef WIN32


//信息码
#define  _RECV_SUC					  6									  //接收成功
#define  _SEND_SUC					  5									  //发送成功
#define  _CON_SUC					  4									  //连接成功
#define  _BIND_SUC				   	  3									  //绑定成功
#define  _OPT_SUC					  2									  //操作成功
//                                    1                                   //成功

//错误码
#define   _ERROR_			          0									  //没有错误
#define   _ERROR_Not_Init			 -1									  //没有初始化
#define   _ERROR_Param			  	 -2									  //参数错误
#define  _ERROR_NO_MEM				 -3 					 			  //内存分配失败
#define  _ERROR_TCP_RECV			 -4 					 			  //TCP接收失败
#define  _ERROR_TCP_DATA			 -5 					 			  //TCP接收数据异常
#define  _ERROR_API_DEL				 -10 					 			  //接口已废除
#define  _ERROR_API_DEVID			 -11 					 			  //设备ID无效

#define  _EEROR_RET_RESERVE          -14								   	  //预留
#define  _EEROR_RET_0001             -15								   	  //设备序号不正确，即报文发错设备设备
#define  _EEROR_RET_0002             -16								   	  //保存文件错误
#define  _EEROR_RET_0003             -17								   	  //升级参数文件版本小于设备内部参数文件版本
#define  _EEROR_RET_0004             -18								   	  //升级文件名格式错或公司号不匹配
#define  _EEROR_RET_0005             -19								   	  //参数内容格式错误
#define  _EEROR_RET_0006             -20								   	  //没补采的数据
#define  _EEROR_RET_0010             -24								   	  //设备号错误

//socket错误
#define  _ERROR_CREATE_SOCKET		 -30 					 	          //创建SOCKET
#define  _ERROR_SOCKET_ReuseAddr	 -31 					 	          //socket复用地址
#define  _ERROR_SOCKET_Bind			 -32 					 	          //socket绑定失败
#define  _ERROR_SOCKET_CON			 -33 					 	          //socket连接失败
#define  _ERROR_SOCKET_DISCON		 -34 					 	          //socket连接断开
#define  _ERROR_SOCKET_RECV		     -35 					 	          //socket发送失败

//下发文件类型
enum  eDownLoadType
{
  e_WhiteList, //白名单
  e_BlackList, //黑名单
  e_SevInfo = 3  //服务器信息
};

//名单内容  需填的数据
//白名单   CardID nCardIDType CardType  
//黑名单   CardID  nCardIDType nLevel
struct  sListNode
{
	unsigned char CardID[20];    //卡号
	int nCardIDType; //卡号类型 1：物理卡号+发卡序列号 2：学籍卡学籍号 3：物理卡号
	int  CardType;   //1:学籍卡；2：家长卡 3：教师卡，其他卡型预留
	int nLevel;       //黑名单等级 00 不能使用	01 锁卡
	unsigned char  SevIP[15];   //服务器IP
	unsigned char  SevPort[5];  //服务器端口
	unsigned char  sHeartBeatTimeSpan[3];  //心跳间隔
};

//交易结构体
struct  sPlayInfo
{
	unsigned char strNo[8];            //Pos机上的交易流水号
	unsigned char strPosID[12];       //Pos机ID即SIM卡号
	unsigned char strSufPOSID[12];       //Pos机子设备ID（BCD码）
	int nPlayType;					  //交易类型，1为白名单交易，2为黑卡交易
	unsigned char strCardID[20];       //物理卡号
	unsigned char strPayTime[20];      //交易时间

	//add  2015.7.2
	unsigned char StudentID[20];       //学籍号   2015.7.2  10改成20
	int nWorkType;                     //工作模式
	int nReadCardMode;				   //读卡模式
};
/*
nReadCardMode，根据此字段，读取后的文件。
简易模式：
Issue file字段无效
F05 file字段无效
F06 file字段无效
F07 file字段无效
标准模式：
Issue file字段有效
F05 file字段13-140字节有效，其余字节无效
F06 file字段3-39字节有效，其余字节无效
F07 file字段7F标签记录有效，其余字节无效
完全模式：
Issue file字段有效
F05 file字段有效
F06 file字段有效
F07 file字段有效
*/

//发行信息 25字节
struct sIssueInfo
{
	unsigned char strCtype[1];     //卡类型
	unsigned char strCVersion[1];  //卡版本
	unsigned char strCityID[2];    //城市代码
	unsigned char strISSSN[4];     //发行序列号
	unsigned char strUID[4];       //发行唯一代码
	unsigned char strAPPID[4];     //应用代码
	unsigned char strFEAT[2];      //特性代码
	unsigned char strIDATE[4];     //卡片发型日期
	unsigned char strTIME[3];      //卡片发行时间
};

//F05  160字节
struct   sF05
{
	unsigned char sFileType[1];      //数据格式类型
	unsigned char sFileVer[1];       //数据格式版本号
	unsigned char sHSTUID[10];       // 学籍号
	unsigned char sHName[40];        //学生姓名
	unsigned char sHID[32];           //证件号
	unsigned char sHID_Type[1];        //证件类型
	unsigned char sSCH_ID[5];          //学校代码
	unsigned char sCH_Name[40];        //学校名称
	unsigned char sH_BirthDate[4];     //出生日期
	unsigned char sHGender[1];          //性别
	unsigned char sHEth[1];             //民族
	unsigned char sNation[2];           //国籍
	unsigned char sStage[1];            //学校
	unsigned char sBlood[1];            //血型
	unsigned char sRfu[20];              //0xff填充
};

//F06 60字节
struct  sF06 
{
	unsigned char sFile_Type[1];             //数据格式类型
	unsigned char sFile_version[1];         //数据格式版本号
	unsigned char sG_Name[26];              //监护人姓名
	unsigned char sGType[1];               //监护人类型
	unsigned char sGTel[10];               //电话
	unsigned char sRfu[21];                //0xff填充
};

//出入数据请求
struct  sOIReqInfo
{
	unsigned char sPiccCardId[16];          //卡片卡号(字母大写)
	unsigned char sCardIdType[2];           //卡号类型 1:物理卡号+发卡序列号 2:学籍卡学籍号
	unsigned char sTerminalId[12];			 //终端POS机设备号
	unsigned char sSubTerminalId[12];       //终端子设备号
	unsigned char sTerminalDate[14];        //考勤机出入请求时间，YYYYMMDDhhmmss
	unsigned char sStudentCode[60];         //预留
};

//补采模式
enum e_ConsRecordType
{
	e_Days = 1,//按天数，如;3标示采集3天
	e_Date, //按日期时间，如：20140228000000标示补采2014年2月28日
	e_TimeSpan//指定日期时间范围,如2014022700000020140228000000；表示补采2014年2月27日到2014年2月28日
};

//回调函数
typedef void (CALLBACK  *AliveCB)( const char* sTime,  //收到心跳的时间，如：2014-10-8-15:02:00
								  unsigned char* pData,	//心跳报文内容
								  int nLen);			//心跳包长度

typedef void (CALLBACK  *ChecktimeCB)( int& nYear,int& nMonth,int&nDay,
									  int &nHour,int& nMin,int& nSec);  
//操作状态回调
//参数
//pos机编号
//信息码
//解释
typedef void (CALLBACK  *StatusCB)(const char* sDeviceID, int nCode,const char* sDes);  

//交易记录回调
//sDeviceID POS编号
//iEventCnt 交易数
//pPlayRec  交易字符串，解析参见sPlayInfo结构体，以逗号分隔
//nPlayRec  pPlayRec的长度
//pIssueFile 发行文件
//nIssueFile pIssueFile的长度
//pF05File  F05文件
//nF05File  F05文件的长度
//pF06File  F06文件
//nF06File  F06文件的长度
//pF07File  F07文件
//nF07File  F07文件的长度
//psPlayInfo 结构体指针
//nLast 是否结束
typedef void (CALLBACK  *PlayRecordCB)(const char* sDeviceID,    
									   int iEventCnt,
									   const char* pPlayRec,
									   int nPlayRec,
									   const unsigned char* pIssueFile,
									   int nIssueFile,
									   const unsigned char* pF05File,
									   int nF05File,
									   const unsigned char* pF06File,
									   int nF06File,
									   const unsigned char* pF07File,
									   int nF07File,
									   sPlayInfo*psPlayInfo,
									   int nLast);  
/*请求激活PIN码回调
sDeviceID 设备ID
sPointID  终端号
sActivePINCardID 激活PIN码，不超过12个字符
nActivePINCardLevel，激活PIN码级别，不超过2个字符
*/
typedef void (CALLBACK *ActivePINCB)(const char* sDeviceID,const char* sPointID,  char *sActivePINID,int& nActivePINLevel);

/*出入请求回调  add 2015.6.25
sDeviceID POS编号
pOIReq 参见sOIReqInfo 格式为sPiccCardId,sCardIdType,sTerminalId,sSubTerminalId,sTerminalDate,sStudentCode
nLast 是否结束
sStudentCode,学生信息，最多60个字节，预留,暂不处理
nCardType  卡类型，1:学籍卡；2：家长卡。其他卡型预留
nPiccStatus  卡片出入状态
正常出入：             0
一段时间内多次出入：   1
卡片已挂失：           2
已有家长入校：         3
之前异常出入学校：     4
其他待定
nPiccRecordSave 卡片出入记录保存状态 
不保存该卡片出入记录：0
保存该卡片出入记录：  1
*/
typedef void (CALLBACK  *OIReqCB)(const char* sDeviceID,const char* pOIReq,int nLast,char* sStudentCode,int& nCardType,int& nPiccStatus,int& nPiccRecordSave);  

//获取版本号
ConCardReader_EXPORT_ const char*  ConCR_GetVersion(void);

//获取设备号
//@param[in]：设备IP
//@param[in]：设备端口
ConCardReader_EXPORT_  char* ConCR_GetDevID(const char* sIP,int nPort);

//初始化
//返回值,TRUE为发送成功，<=0为错误，详见错误码。
//UDP端口
ConCardReader_EXPORT_ int    ConCR_Initial(int nUDPPort,
										   StatusCB statuscb,  //状态回调
										   AliveCB alivecb,    //心跳回调
										   ChecktimeCB checktimecb, //校时回调
										   PlayRecordCB UploadPlaycb, //上传交易回调
										   ActivePINCB ActivePINcb,  //激活PIN回调
										   OIReqCB OIReqcb); //出入请求回调

//下发补采集,需先执行初始化
//@param[in]：IP
//@param[in]：端口
//@param[in]：机器序号,不超过32个字节
//@param[in]：补采集模式
//@param[in]：补采时间
//@param[in]：交易记录回调
//返回值,TRUE为发送成功，<=0为错误，详见错误码。
ConCardReader_EXPORT_ int    ConCR_GetConsRecord(const char* sIP,
												 int nPort,
												 const char* sDeviceID,
												 e_ConsRecordType eCRtype,
												 const char* sDes,
												 PlayRecordCB playrecordcb);

//下发文件,需先执行初始化
//@param[in]：IP
//@param[in]：端口
//@param[in]：机器序号,不超过32个字节
//日期，14个字节，如20140219140001
//公司码，必须为三位，如"804"
//类型，0为白名单，1为黑名单，其他的暂不接受
//返回值,TRUE为发送成功，<=0为错误，详见错误码。
ConCardReader_EXPORT_ int ConCR_DownLoadList(const char* sIP,int nPort,const char* sDeviceID,
											 const char* sDate, const char* CompanyCode,int nType,int nList,sListNode* psList);

/*下发文件,用字符串,需先执行初始化
@param[in]：IP
@param[in]：端口
@param[in]：机器序号,不超过32个字节
@param[in]：日期，14个字节，如20140219140001
@param[in]：公司码，必须为三位，如"804"
@param[in]：下发文件类型，详见eDownLoadType定义
@param[in]：nList为个数
@param[in]：pListBuf的格式为卡号|类型|卡号|类型....
返回值,TRUE为发送成功，<=0为错误，详见错误码。
名单：CardID| nCardType| nCardTyp |…。
黑名单：CardID| CardIDType| nLevel |…。
服务器信息：SevIP|SevPort|HeartBeatTimeSpan|…。
*/

ConCardReader_EXPORT_ int ConCR_DownLoadList_str(const char* sIP,int nPort,const char* sDeviceID,
												 const char* sDate, const char* CompanyCode,eDownLoadType eType,int nList,char* pListBuf);
//反初始化
ConCardReader_EXPORT_ void    ConCR_DeInitial(void);
#endif