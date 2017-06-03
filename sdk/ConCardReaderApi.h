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


//��Ϣ��
#define  _RECV_SUC					  6									  //���ճɹ�
#define  _SEND_SUC					  5									  //���ͳɹ�
#define  _CON_SUC					  4									  //���ӳɹ�
#define  _BIND_SUC				   	  3									  //�󶨳ɹ�
#define  _OPT_SUC					  2									  //�����ɹ�
//                                    1                                   //�ɹ�

//������
#define   _ERROR_			          0									  //û�д���
#define   _ERROR_Not_Init			 -1									  //û�г�ʼ��
#define   _ERROR_Param			  	 -2									  //��������
#define  _ERROR_NO_MEM				 -3 					 			  //�ڴ����ʧ��
#define  _ERROR_TCP_RECV			 -4 					 			  //TCP����ʧ��
#define  _ERROR_TCP_DATA			 -5 					 			  //TCP���������쳣
#define  _ERROR_API_DEL				 -10 					 			  //�ӿ��ѷϳ�
#define  _ERROR_API_DEVID			 -11 					 			  //�豸ID��Ч

#define  _EEROR_RET_RESERVE          -14								   	  //Ԥ��
#define  _EEROR_RET_0001             -15								   	  //�豸��Ų���ȷ�������ķ����豸�豸
#define  _EEROR_RET_0002             -16								   	  //�����ļ�����
#define  _EEROR_RET_0003             -17								   	  //���������ļ��汾С���豸�ڲ������ļ��汾
#define  _EEROR_RET_0004             -18								   	  //�����ļ�����ʽ���˾�Ų�ƥ��
#define  _EEROR_RET_0005             -19								   	  //�������ݸ�ʽ����
#define  _EEROR_RET_0006             -20								   	  //û���ɵ�����
#define  _EEROR_RET_0010             -24								   	  //�豸�Ŵ���

//socket����
#define  _ERROR_CREATE_SOCKET		 -30 					 	          //����SOCKET
#define  _ERROR_SOCKET_ReuseAddr	 -31 					 	          //socket���õ�ַ
#define  _ERROR_SOCKET_Bind			 -32 					 	          //socket��ʧ��
#define  _ERROR_SOCKET_CON			 -33 					 	          //socket����ʧ��
#define  _ERROR_SOCKET_DISCON		 -34 					 	          //socket���ӶϿ�
#define  _ERROR_SOCKET_RECV		     -35 					 	          //socket����ʧ��

//�·��ļ�����
enum  eDownLoadType
{
  e_WhiteList, //������
  e_BlackList, //������
  e_SevInfo = 3  //��������Ϣ
};

//��������  ���������
//������   CardID nCardIDType CardType  
//������   CardID  nCardIDType nLevel
struct  sListNode
{
	unsigned char CardID[20];    //����
	int nCardIDType; //�������� 1��������+�������к� 2��ѧ����ѧ���� 3��������
	int  CardType;   //1:ѧ������2���ҳ��� 3����ʦ������������Ԥ��
	int nLevel;       //�������ȼ� 00 ����ʹ��	01 ����
	unsigned char  SevIP[15];   //������IP
	unsigned char  SevPort[5];  //�������˿�
	unsigned char  sHeartBeatTimeSpan[3];  //�������
};

//���׽ṹ��
struct  sPlayInfo
{
	unsigned char strNo[8];            //Pos���ϵĽ�����ˮ��
	unsigned char strPosID[12];       //Pos��ID��SIM����
	unsigned char strSufPOSID[12];       //Pos�����豸ID��BCD�룩
	int nPlayType;					  //�������ͣ�1Ϊ���������ף�2Ϊ�ڿ�����
	unsigned char strCardID[20];       //������
	unsigned char strPayTime[20];      //����ʱ��

	//add  2015.7.2
	unsigned char StudentID[20];       //ѧ����   2015.7.2  10�ĳ�20
	int nWorkType;                     //����ģʽ
	int nReadCardMode;				   //����ģʽ
};
/*
nReadCardMode�����ݴ��ֶΣ���ȡ����ļ���
����ģʽ��
Issue file�ֶ���Ч
F05 file�ֶ���Ч
F06 file�ֶ���Ч
F07 file�ֶ���Ч
��׼ģʽ��
Issue file�ֶ���Ч
F05 file�ֶ�13-140�ֽ���Ч�������ֽ���Ч
F06 file�ֶ�3-39�ֽ���Ч�������ֽ���Ч
F07 file�ֶ�7F��ǩ��¼��Ч�������ֽ���Ч
��ȫģʽ��
Issue file�ֶ���Ч
F05 file�ֶ���Ч
F06 file�ֶ���Ч
F07 file�ֶ���Ч
*/

//������Ϣ 25�ֽ�
struct sIssueInfo
{
	unsigned char strCtype[1];     //������
	unsigned char strCVersion[1];  //���汾
	unsigned char strCityID[2];    //���д���
	unsigned char strISSSN[4];     //�������к�
	unsigned char strUID[4];       //����Ψһ����
	unsigned char strAPPID[4];     //Ӧ�ô���
	unsigned char strFEAT[2];      //���Դ���
	unsigned char strIDATE[4];     //��Ƭ��������
	unsigned char strTIME[3];      //��Ƭ����ʱ��
};

//F05  160�ֽ�
struct   sF05
{
	unsigned char sFileType[1];      //���ݸ�ʽ����
	unsigned char sFileVer[1];       //���ݸ�ʽ�汾��
	unsigned char sHSTUID[10];       // ѧ����
	unsigned char sHName[40];        //ѧ������
	unsigned char sHID[32];           //֤����
	unsigned char sHID_Type[1];        //֤������
	unsigned char sSCH_ID[5];          //ѧУ����
	unsigned char sCH_Name[40];        //ѧУ����
	unsigned char sH_BirthDate[4];     //��������
	unsigned char sHGender[1];          //�Ա�
	unsigned char sHEth[1];             //����
	unsigned char sNation[2];           //����
	unsigned char sStage[1];            //ѧУ
	unsigned char sBlood[1];            //Ѫ��
	unsigned char sRfu[20];              //0xff���
};

//F06 60�ֽ�
struct  sF06 
{
	unsigned char sFile_Type[1];             //���ݸ�ʽ����
	unsigned char sFile_version[1];         //���ݸ�ʽ�汾��
	unsigned char sG_Name[26];              //�໤������
	unsigned char sGType[1];               //�໤������
	unsigned char sGTel[10];               //�绰
	unsigned char sRfu[21];                //0xff���
};

//������������
struct  sOIReqInfo
{
	unsigned char sPiccCardId[16];          //��Ƭ����(��ĸ��д)
	unsigned char sCardIdType[2];           //�������� 1:������+�������к� 2:ѧ����ѧ����
	unsigned char sTerminalId[12];			 //�ն�POS���豸��
	unsigned char sSubTerminalId[12];       //�ն����豸��
	unsigned char sTerminalDate[14];        //���ڻ���������ʱ�䣬YYYYMMDDhhmmss
	unsigned char sStudentCode[60];         //Ԥ��
};

//����ģʽ
enum e_ConsRecordType
{
	e_Days = 1,//����������;3��ʾ�ɼ�3��
	e_Date, //������ʱ�䣬�磺20140228000000��ʾ����2014��2��28��
	e_TimeSpan//ָ������ʱ�䷶Χ,��2014022700000020140228000000����ʾ����2014��2��27�յ�2014��2��28��
};

//�ص�����
typedef void (CALLBACK  *AliveCB)( const char* sTime,  //�յ�������ʱ�䣬�磺2014-10-8-15:02:00
								  unsigned char* pData,	//������������
								  int nLen);			//����������

typedef void (CALLBACK  *ChecktimeCB)( int& nYear,int& nMonth,int&nDay,
									  int &nHour,int& nMin,int& nSec);  
//����״̬�ص�
//����
//pos�����
//��Ϣ��
//����
typedef void (CALLBACK  *StatusCB)(const char* sDeviceID, int nCode,const char* sDes);  

//���׼�¼�ص�
//sDeviceID POS���
//iEventCnt ������
//pPlayRec  �����ַ����������μ�sPlayInfo�ṹ�壬�Զ��ŷָ�
//nPlayRec  pPlayRec�ĳ���
//pIssueFile �����ļ�
//nIssueFile pIssueFile�ĳ���
//pF05File  F05�ļ�
//nF05File  F05�ļ��ĳ���
//pF06File  F06�ļ�
//nF06File  F06�ļ��ĳ���
//pF07File  F07�ļ�
//nF07File  F07�ļ��ĳ���
//psPlayInfo �ṹ��ָ��
//nLast �Ƿ����
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
/*���󼤻�PIN��ص�
sDeviceID �豸ID
sPointID  �ն˺�
sActivePINCardID ����PIN�룬������12���ַ�
nActivePINCardLevel������PIN�뼶�𣬲�����2���ַ�
*/
typedef void (CALLBACK *ActivePINCB)(const char* sDeviceID,const char* sPointID,  char *sActivePINID,int& nActivePINLevel);

/*��������ص�  add 2015.6.25
sDeviceID POS���
pOIReq �μ�sOIReqInfo ��ʽΪsPiccCardId,sCardIdType,sTerminalId,sSubTerminalId,sTerminalDate,sStudentCode
nLast �Ƿ����
sStudentCode,ѧ����Ϣ�����60���ֽڣ�Ԥ��,�ݲ�����
nCardType  �����ͣ�1:ѧ������2���ҳ�������������Ԥ��
nPiccStatus  ��Ƭ����״̬
�������룺             0
һ��ʱ���ڶ�γ��룺   1
��Ƭ�ѹ�ʧ��           2
���мҳ���У��         3
֮ǰ�쳣����ѧУ��     4
��������
nPiccRecordSave ��Ƭ�����¼����״̬ 
������ÿ�Ƭ�����¼��0
����ÿ�Ƭ�����¼��  1
*/
typedef void (CALLBACK  *OIReqCB)(const char* sDeviceID,const char* pOIReq,int nLast,char* sStudentCode,int& nCardType,int& nPiccStatus,int& nPiccRecordSave);  

//��ȡ�汾��
ConCardReader_EXPORT_ const char*  ConCR_GetVersion(void);

//��ȡ�豸��
//@param[in]���豸IP
//@param[in]���豸�˿�
ConCardReader_EXPORT_  char* ConCR_GetDevID(const char* sIP,int nPort);

//��ʼ��
//����ֵ,TRUEΪ���ͳɹ���<=0Ϊ������������롣
//UDP�˿�
ConCardReader_EXPORT_ int    ConCR_Initial(int nUDPPort,
										   StatusCB statuscb,  //״̬�ص�
										   AliveCB alivecb,    //�����ص�
										   ChecktimeCB checktimecb, //Уʱ�ص�
										   PlayRecordCB UploadPlaycb, //�ϴ����׻ص�
										   ActivePINCB ActivePINcb,  //����PIN�ص�
										   OIReqCB OIReqcb); //��������ص�

//�·����ɼ�,����ִ�г�ʼ��
//@param[in]��IP
//@param[in]���˿�
//@param[in]���������,������32���ֽ�
//@param[in]�����ɼ�ģʽ
//@param[in]������ʱ��
//@param[in]�����׼�¼�ص�
//����ֵ,TRUEΪ���ͳɹ���<=0Ϊ������������롣
ConCardReader_EXPORT_ int    ConCR_GetConsRecord(const char* sIP,
												 int nPort,
												 const char* sDeviceID,
												 e_ConsRecordType eCRtype,
												 const char* sDes,
												 PlayRecordCB playrecordcb);

//�·��ļ�,����ִ�г�ʼ��
//@param[in]��IP
//@param[in]���˿�
//@param[in]���������,������32���ֽ�
//���ڣ�14���ֽڣ���20140219140001
//��˾�룬����Ϊ��λ����"804"
//���ͣ�0Ϊ��������1Ϊ���������������ݲ�����
//����ֵ,TRUEΪ���ͳɹ���<=0Ϊ������������롣
ConCardReader_EXPORT_ int ConCR_DownLoadList(const char* sIP,int nPort,const char* sDeviceID,
											 const char* sDate, const char* CompanyCode,int nType,int nList,sListNode* psList);

/*�·��ļ�,���ַ���,����ִ�г�ʼ��
@param[in]��IP
@param[in]���˿�
@param[in]���������,������32���ֽ�
@param[in]�����ڣ�14���ֽڣ���20140219140001
@param[in]����˾�룬����Ϊ��λ����"804"
@param[in]���·��ļ����ͣ����eDownLoadType����
@param[in]��nListΪ����
@param[in]��pListBuf�ĸ�ʽΪ����|����|����|����....
����ֵ,TRUEΪ���ͳɹ���<=0Ϊ������������롣
������CardID| nCardType| nCardTyp |����
��������CardID| CardIDType| nLevel |����
��������Ϣ��SevIP|SevPort|HeartBeatTimeSpan|����
*/

ConCardReader_EXPORT_ int ConCR_DownLoadList_str(const char* sIP,int nPort,const char* sDeviceID,
												 const char* sDate, const char* CompanyCode,eDownLoadType eType,int nList,char* pListBuf);
//����ʼ��
ConCardReader_EXPORT_ void    ConCR_DeInitial(void);
#endif