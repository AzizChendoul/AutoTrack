import java.rmi.Remote; import java.rmi.RemoteException; public interface RemoteService extends Remote { String analyzeDiagnostic(VehicleInfo v) throws RemoteException; }
