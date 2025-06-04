package services.auth.repository;

import services.auth.entity.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio para la entidad Usuario
 */
@Repository
public interface UsuarioRepository extends MongoRepository<Usuario, String> {
    
    /**
     * Busca un usuario por su nombre de usuario
     * @param nombreUsuario nombre de usuario a buscar
     * @return usuario encontrado (Optional)
     */
    Optional<Usuario> findByNombreUsuario(String nombreUsuario);
    
    /**
     * Busca un usuario por su correo electrónico
     * @param correo correo a buscar
     * @return usuario encontrado (Optional)
     */
    Optional<Usuario> findByCorreo(String correo);
    
    /**
     * Verifica si existe un usuario con el nombre de usuario proporcionado
     * @param nombreUsuario nombre de usuario a verificar
     * @return true si existe, false en caso contrario
     */
    boolean existsByNombreUsuario(String nombreUsuario);
    
    /**
     * Verifica si existe un usuario con el correo proporcionado
     * @param correo correo a verificar
     * @return true si existe, false en caso contrario
     */
    boolean existsByCorreo(String correo);
}
