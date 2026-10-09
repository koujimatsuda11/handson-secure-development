import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm'
import { User } from './User'

export enum PostType {
  POST = 'post',
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar', { length: 255,comment: '投稿内容' })
  content:string

  @Column({ type: 'enum', enum: PostType, default: PostType.POST, comment: '投稿タイプ' })
  type: PostType

  @CreateDateColumn({ comment: '投稿日時' })
  readonly posted_at: Date

  @ManyToOne(() => User, (user) => user.posts, { nullable: false })
  user: User

  @ManyToMany(() => User, (user) => user.likes)
  @JoinTable()
  users: User[];

  canBeCreatedBy(userId: number): boolean {
    return this.user.id === userId;
  }

  canBeReadBy(): boolean {
    return true;
  }

  canBeUpdatedBy(userId: number): boolean {
    return this.user.id === userId;
  }

  canBeDeletedBy(userId: number): boolean {
    return this.user.id === userId;
  }

  canBeLikedBy(): boolean {
    return true;
  }

  canBeUnlikedBy(): boolean {
    return true;
  }

}
